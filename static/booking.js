getBookingStatus();

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
        let bookingData = data.data;
        let bookingName = document.querySelector("#booking-name");
        bookingName.textContent= data["username"];



        // console.log(bookingData)
        if (bookingData == null){
            let bookingcontainer = document.querySelector(".booking-container");
            let footer = document.querySelector("#footer");
            // let noneOrder= document.querySelector(".none-order");
            
            // noneOrder.style.display="block";
            bookingcontainer.textContent = "目前沒有任何待預訂的行程";
            bookingcontainer.style =" margin: 30px auto";
            // document.querySelector("body").style.backgroundColor = "#757575";
            // document.querySelector("booking-main").style.backgroundColor = "#ffffff";
            // document.querySelector(".nav-box").style.backgroundColor = "#ffffff";
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

            // let bookingName = document.querySelector("#booking-name");
            // bookingName.textContent= data["username"];

                
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
        // let bookingcontainer = document.querySelector(".booking-container");
        // bookingcontainer.innerHTML = "";
        // bookingcontainer.textContent = "目前沒有任何待預訂的行程";
        window.location.reload();
      }
    });
});
