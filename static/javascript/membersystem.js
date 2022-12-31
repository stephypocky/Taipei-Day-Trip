const editUsernameBtn = document.querySelector(".edit-username-btn");
const membersysteNewusername = document.querySelector(".membersystem-newusername");
const membersystemUsername = document.querySelector(".membersystem-username");
const saveUsernameBtn = document.querySelector(".save-username-btn");
const indexBtn = document.querySelector(".index-btn");

// ------- 檢查會員登入狀態 ------- 
    
function userStatus(){
    fetch(`/api/user/auth`,{
        method: "GET",
        credentials: 'same-origin',
    })
    .then((response) => response.json())
    .then((data) => {
        let memberData = data["data"];
        let signinNav = document.querySelector("#signinnav");
        if(memberData != null){
            signinNav.textContent="登出系統";
            signinNav.removeAttribute("onclick","showSignin()");
            signinNav.setAttribute("onclick","logout()");
        } else {
            signinNav.textContent="登入/註冊";
        }
    });
};

//------ 點擊 修改姓名資料 btn ------
editUsernameBtn.addEventListener("click", function(){
    membersysteNewusername.style.display ="inline-block";
    membersystemUsername.style.display = "none";
});

//------ 點擊 儲存姓名資料 btn ------
saveUsernameBtn.addEventListener("click", function(){
    let membersysteNewusernameValue= document.querySelector(".membersystem-newusername").value;
    console.log(membersysteNewusernameValue)
    fetch(`/api/user`,{
        method: "PATCH",
        headers: {"Content-Type":"application/json"}, 
        body: JSON.stringify({"username": membersysteNewusernameValue})
    })  
    .then((response) => response.json())
    .then((data) => {
        // console.log(data);
        membersystemUsername.style.display = "inline-block";
        membersystemUsername.textContent = membersysteNewusernameValue;
        membersysteNewusername.style.display ="none";


});

    
});


// ------ 檢查登入資訊 ------
fetch(`/api/user/auth`,{
    method: "GET",
    credentials: 'same-origin',
})
.then((response) => response.json())
.then((data) => {
    // console.log(data);
    let membersystemUsername = document.querySelector(".membersystem-username");
    let membersystemEmail = document.querySelector(".membersystem-email");
    membersystemUsername.textContent=data.data.username;
    membersystemEmail.textContent = data.data.email;

});

//------ 拿出歷史訂單資料 ------
fetch(`/api/order`)
    .then((response) => response.json())
    .then((data) => {
      
        const bookingData = data.data;
        console.log(bookingData);
 
        if(bookingData){

            let bookingInfoAll = document.querySelector(".booking-info-all");

        
            for (i=0; i in bookingData; i++){

                // console.log(i);
                let imgURL = bookingData[i]["trip"]["attraction"]["image"];
                let nameContent = bookingData[i]["trip"]["attraction"]["name"];
                let addressContent = bookingData[i]["trip"]["attraction"]["address"];
                let priceContent = bookingData[i]["price"];
                let dateContent = bookingData[i]["trip"]["date"];
                let timeContent = bookingData[i]["trip"]["time"];
                let orderNumberContent= bookingData[i]["number"];
                if (timeContent == "morning") {
                    timeText = "早上 9 點到中午 12 點";
                } else {
                    timeText = "下午 1 點到下午 4 點";
                }
                let orderNumberText= document.querySelector(".order-number");
                orderNumberText.textContent= "訂單編號 : " + orderNumberContent ;

                let bookingInfoBox = document.createElement("div");
                bookingInfoBox.setAttribute("class", "booking-info-box");
                bookingInfoAll.appendChild(bookingInfoBox);

                let bookingImgBox = document.createElement("div");
                bookingImgBox.setAttribute("class", "booking-img-box");
                bookingInfoBox.appendChild(bookingImgBox)

                let bookingInfo = document.createElement("div");
                bookingInfo.setAttribute("id", "booking-info");
                bookingInfoBox.appendChild(bookingInfo);

                
                let bookingImg = document.createElement("img");
                bookingImg.setAttribute("id", "booking-img");
                bookingImg.src = imgURL;
                bookingInfoBox.appendChild(bookingImgBox);
                bookingImgBox.appendChild(bookingImg);
                
                bookingInfoBox.appendChild(bookingInfo);
                // bookingInfoAll.appendChild(bookingInfoBox);

                let mainTitle = document.createElement("div");
                mainTitle.setAttribute("class", "booking-attra-name");
                mainTitle.innerText = "台北一日遊： " + nameContent;
                bookingInfo.appendChild(mainTitle);
               

                let dateTitle = document.createElement("div");
                dateTitle.setAttribute("class", "booking-attra-text");
                dateTitle.innerText = "日期： ";
                bookingInfo.appendChild(dateTitle);
 
                let dateSpan = document.createElement("span");
                dateSpan.setAttribute("class", "booking-attra-span");
                dateSpan.innerText = dateContent;
                dateTitle.appendChild(dateSpan);

                let timeTitle = document.createElement("div");
                timeTitle.setAttribute("class", "booking-attra-text");
                timeTitle.innerText = "時間： ";
                bookingInfo.appendChild(timeTitle);
             
                let timeSpan= document.createElement("span");
                timeSpan.setAttribute("class", "booking-attra-span");
                timeSpan.innerText = timeText;
                timeTitle.appendChild(timeSpan);

                let priceTitle = document.createElement("div");
                priceTitle.setAttribute("class", "booking-attra-text");
                priceTitle.innerText = "費用： ";
                bookingInfo.appendChild(priceTitle);
              
                let priceSpan = document.createElement("span");
                timeSpan.setAttribute("class", "booking-attra-span");
                priceSpan.innerText = "新台幣 "+ priceContent +" 元"; 
                priceTitle.appendChild(priceSpan);

                let addressTitle = document.createElement("div");
                addressTitle.setAttribute("class", "booking-attra-text");
                addressTitle.innerText = "地點： ";
                bookingInfo.appendChild(addressTitle);
              
                let addressSpan = document.createElement("span");
                addressSpan.setAttribute("class", "booking-attra-span");
                addressSpan.innerText = addressContent;
                addressTitle.appendChild(addressSpan);

            }
        } 
  

});

//------ 點擊 回首頁 btn ------

indexBtn.addEventListener("click", function(){
    window.location.href="/";

})

// ------- 登出 ------- 

function logout(){
    fetch(`/api/user/auth`,{
        method: "DELETE",
        credentials: 'same-origin',
    })
    .then((response) => response.json())
    .then((data) => {
        let logoutData = data["ok"];
        if(logoutData){
            window.location.href="/";
        }
    });
};