window.addEventListener("load", function(){
    // console.log("hello");
    let order = window.location.href.split("=");
    // console.log(order);
    orderNumber= order[1];
    // console.log(orderNumber);

    let orderNumberText= document.querySelector(".order-number");
    orderNumberText.textContent= "訂單編號 : "+ orderNumber ;

    fetch(`/api/order/${orderNumber}`,{
        method: "GET",
        headers: {
        'Content-Type':'application/json'
        }
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        const bookingData = data.data;

        if(bookingData){
            //  ------- 取得預定的的景點資訊 ------- 
            let imgURL = bookingData["trip"]["attraction"]["image"];
            let nameContent = bookingData["trip"]["attraction"]["name"];
            let addressContent = bookingData["trip"]["attraction"]["address"];
            let priceContent = bookingData["price"];
            let dateContent = bookingData["trip"]["date"];
            let timeContent = bookingData["trip"]["time"];
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

            let pastOrderBtn=document.querySelector(".past-order-btn")
            pastOrderBtn.style.display="block";
        }else {
            window.location.href="/";
        }
    });
});

// ------- 點擊 會員中心/歷史訂單 btn-------
let pastOrderBtn=document.querySelector(".past-order-btn")
pastOrderBtn.addEventListener("click", function(){
    window.location=`/member`;
})
