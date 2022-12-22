
getBookingStatus();



// ------- 取得尚未下單的預訂行程 -------
function getBookingStatus(){
    fetch(`/api/booking`,{
        method: "GET",
    })
    .then((response) => response.json())
    .then((data) => {
        let message = data.message;
        if (message == "使用者未登入"){
            window.location.href="/";
            return
        }
        const bookingData = data.data;
        let bookingName = document.querySelector("#booking-name");
        let contactName = document.querySelector("#contact-name");
        let bookingEmail = document.querySelector("#booking-email");
        bookingName.textContent= data["username"];
        contactName.value= data["username"];
        bookingEmail.value= data["email"];
    
        if (bookingData == null){
            let bookingcontainer = document.querySelector(".booking-container");
            let footer = document.querySelector("#footer");
    
            bookingcontainer.textContent = "目前沒有任何待預訂的行程";
            bookingcontainer.style =" margin: 30px auto";
            footer.style = "height: 100vh; position:fixed; width:100%";
            // footer.style = "padding-bottom: 450px";

        } else {

            //  ------- 取得預定的的景點資訊 ------- 

            let imgURL = bookingData["attraction"]["image"];
            let nameContent = bookingData["attraction"]["name"];
            let addressContent = bookingData["attraction"]["address"];
            let priceContent = bookingData["price"];
            let dateContent = bookingData["date"];
            let timeContent = bookingData["time"];
            if (timeContent == "morning") {
                timeText = "早上 9 點到中午 12 點";
            } else {
                timeText = "下午 1 點到下午 4 點";
            }
                
            // ------- DOM -------
            const bookingInfo=document.querySelector("#booking-info");

            let img = document.querySelector("#booking-img");
            img.src = imgURL;

            let mainTitle = document.createElement("div");
            mainTitle.setAttribute("class", "booking-attra-name");
            mainTitle.innerText = "台北一日遊： " + nameContent;
            bookingInfo.append(mainTitle);

            let dateTitle = document.createElement("div");
            dateTitle.setAttribute("class", "booking-attra-text");
            dateTitle.innerText = "日期： ";
            bookingInfo.append(dateTitle);
            let dateSpan = document.createElement("span");
            dateSpan.setAttribute("class", "booking-attra-span");
            dateSpan.innerText = dateContent;
            dateTitle.appendChild(dateSpan);

            let timeTitle = document.createElement("div");
            timeTitle.setAttribute("class", "booking-attra-text");
            timeTitle.innerText = "時間： ";
            bookingInfo.append(timeTitle);
            let timeSpan= document.createElement("span");
            timeSpan.setAttribute("class", "booking-attra-span");
            timeSpan.innerText = timeText;
            timeTitle.appendChild(timeSpan);

            let priceTitle = document.createElement("div");
            priceTitle.setAttribute("class", "booking-attra-text");
            priceTitle.innerText = "費用： ";
            bookingInfo.append(priceTitle);
            let priceSpan = document.createElement("span");
            timeSpan.setAttribute("class", "booking-attra-span");
            priceSpan.innerText = "新台幣 "+ priceContent +" 元"; 
            priceTitle.appendChild(priceSpan);

            let addressTitle = document.createElement("div");
            addressTitle.setAttribute("class", "booking-attra-text");
            addressTitle.innerText = "地點： ";
            bookingInfo.append(addressTitle);
            let addressSpan = document.createElement("span");
            addressSpan.setAttribute("class", "booking-attra-span");
            addressSpan.innerText = addressContent;
            addressTitle.appendChild(addressSpan);

            let totalAmount = document.querySelector(".total-amount")
            totalAmount.innerText = "總價：新台幣 " + priceContent + " 元";
        }
        //使用 TPDirect.card.getPrime 取得 Prime
        const orderForm = document.querySelector(".order");


        orderForm.addEventListener("submit", function(event){
            event.preventDefault();
            // 取得 TapPay Fields 的 status
            const tappayStatus = TPDirect.card.getTappayFieldsStatus();
            let alertMessage = document.querySelector("#alert-message");
            // console.log(tappayStatus);

            // 確認是否可以 getPrime (failed)
            if (tappayStatus.canGetPrime === false) {
                // alertMessage.textContent="請確認付款資訊是否正確"
                alert("can not get prime");
                return;
            }

            // Get prime

            TPDirect.card.getPrime((result) => {
                if (result.status !== 0) {
                    // alertMessage.textContent='"get prime error" + result.msg'
                    alert('get prime error ' + result.msg)
                    return;
                }
                console.log('get prime 成功，prime: ' + result.card.prime);

                //prime傳遞後端
                
                let orderData = {
                    prime: result.card.prime, 
                    order: {
                        price: data.data["price"],
                        trip: {
                            attraction: {
                                id: data.data["attraction"]["id"],
                                name: bookingData["attraction"]["name"],
                                address: bookingData["attraction"]["address"],
                                image: bookingData["attraction"]["image"]
                            },
                            date: bookingData["date"],
                            time: bookingData["time"]
                        },
                        contact: {
                            name: bookingData["username"],
                            email: bookingData["email"],
                            phone: document.querySelector("#phone").value
                        },
                    },
                };
                fetch(`api/orders`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(orderData),
                })
                .then((response) => response.json())
                .then((data)=>{
                    // console.log(data);
                    if (data["error"]) {
                        // console.log("error");
                        // window.location.href="/";
                        let alertMessage = document.querySelector("#alert-message");
                        alertMessage.textContent="付款失敗，請再次嘗試"

                    } else {
                        orderNumber = data.data["number"]
                        // console.log(orderNumber);
                        window.location=`/thankyou?number=${orderNumber}`;
                    }
                })
            })
        })

    });
}

//--------- 刪除預定行程 -------

let bookingDelete = document.querySelector("#booking-delete");
bookingDelete.addEventListener("click", function(){
    fetch(`/api/booking`, {
    method: "DELETE",
    })
    .then((response) => response.json())
    .then((data) => {
      if ("ok" in data) {
        window.location.reload();
      }
    });
});

// ------- Setup SDK -------


TPDirect.setupSDK(
    126890, 
    "app_dcOtWGzEGUI9AdtTsk4lHkqOXSXQpiFOlhnMFDtLo4fUB3vC8HWTsEm832vr",
    "sandbox");

//  ------- 設置 必填 CCV  ------- 

let fields = {
    number: {
        element: document.querySelector("#card-number"),
        placeholder: "**** **** **** ****",
    },
    expirationDate: {
        element: document.querySelector("#card-expiration-date"),
        placeholder: "MM / YY",
    },
    ccv: {
        element: document.querySelector("#card-ccv"),
        placeholder: "CVV",
    },
};

// 把 TapPay 內建 style 放到 div 裡

TPDirect.card.setup({
	fields: fields,
	styles: {
	    "input": {
			color: "gray",
		},
		"input.ccv": {
			"font-size": "16px",
		},
		"input.expiration-date": {
			"font-size": "16px",
		},
		"input.card-number": {
			"font-size": "16px",
		},
		".valid": {
			color: "green",
		},
		".invalid": {
			color: "red",
		},
		"@media screen and (max-width: 400px)": {
			input: {
				color: "orange",
			},
		},
	},
});

//實作 TPDirect.card.onUpdate，得知目前卡片資訊的輸入狀態

const confirmBtn = document.querySelector(".confirm-btn");
TPDirect.card.onUpdate(function (update) {

    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        confirmBtn.removeAttribute("disabled");
    } else {
        // Disable submit Button to get prime.
        confirmBtn.setAttribute("disabled", true);
    }

    // card-number 欄位是錯誤的
    if (update.status.number === 2) {
        //setNumberFormGroupToError(".card-number-div");
    } else if (update.status.number === 0) {
       // setNumberFormGroupToSuccess(".card-number-div");
    } else {
        //setNumberFormGroupToNormal(".card-number-div");
    }

     // expiration 欄位是錯誤的
    if (update.status.expiry === 2) {
       // setNumberFormGroupToError(".expiration-div");
    } else if (update.status.expiry === 0) {
        //setNumberFormGroupToSuccess(".expiration-div");
    } else {
        //setNumberFormGroupToNormal(".expiration-div");
    }

     // ccv 欄位是錯誤的
    if (update.status.ccv === 2) {
       // setNumberFormGroupToError(".ccv-div");
    } else if (update.status.ccv === 0) {
        //setNumberFormGroupToSuccess(".ccv-div");
    } else {
        //setNumberFormGroupToNormal(".ccv-div");
    }
});

 
