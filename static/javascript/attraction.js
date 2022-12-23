let url=window.location.href
id=url.split("/attraction/")[1];

let imageQty = 0; //預設第0張照片



fetch(`/api/attraction/${id}`)
.then((response) => response.json())
.then((data) => {
    //渲染頁面
    getInfo(data)

    // images
    allImages=data["data"]["images"];
    // console.log(allImages);

    let attracionImages=document.querySelector(".attracion-images")

    let imageCount = data["data"]["images"].length;
    // console.log(imageCount);
    attracionImages.src=data["data"]["images"][0];

    //每個第0張圖都有一個黑點點
    let carouselCircle=document.querySelector(".carousel-circle");
    let blackCircle=document.createElement("div");
    blackCircle.setAttribute("class", "white-circle black");
    carouselCircle.appendChild(blackCircle);

    //剩下有幾張圖，就多幾個白點點
    for(let i=0 ; i<imageCount-1 ; i++){
        let whiteCircle=document.createElement("div");
        whiteCircle.setAttribute("class","white-circle");
        carouselCircle.appendChild(whiteCircle);
    }

    //右邊箭頭按鈕
    allImages=data["data"]["images"];

    let rightArrow = document.querySelector(".right-arrow")
    rightArrow.addEventListener("click", function() {
        if(imageQty < imageCount-1){
            attracionImages.src=allImages[imageQty+1];

            let dotBefore = document.querySelector(`.white-circle:nth-child(${imageQty+1})`);
            dotBefore.classList.remove("black");
            let dotAfter = document.querySelector(`.white-circle:nth-child(${imageQty+2})`);
            dotAfter.classList.add("black");

            imageQty+=1;
        }
    })

    //左邊邊箭頭按鈕
    let leftArrow = document.querySelector(".left-arrow")
    leftArrow.addEventListener("click", function() {

        if(imageQty > 0){
            attracionImages.src=allImages[imageQty-1];

            let dotBefore = document.querySelector(`.white-circle:nth-child(${imageQty+1})`);
            dotBefore.classList.remove("black");
            let dotAfter = document.querySelector(`.white-circle:nth-child(${imageQty})`);
            dotAfter.classList.add("black");

            imageQty-=1;
        }
    })
 })

//  選擇時間上/下半天
let daytime=document.querySelector("#daytime");
let nightime=document.querySelector("#nightime");
let bookingfee=document.querySelector(".price");
let selectTime=document.querySelector(".select-time");

function selectFee(){
    daytime.addEventListener("click", function(){
        bookingfee.textContent="2000";
        // daytime.value="morning";
        selectTime.value="morning";
        // bookingfee.attractionTime="morning"
        
    });

    nightime.addEventListener("click", function(){
        bookingfee.textContent="2500";
        // nightime.value="afternoon";
        selectTime.value="afternoon";
        // bookingfee.attractionTime="afternoon"
    });
};

selectFee();


function getInfo(data){
    let attractionName= document.querySelector(".attraction-name");
    let name=data["data"]["name"];   
    attractionName.textContent=name; 
    
    let attractionInfo= document.querySelector(".attraction-info");
    let category=data["data"]["category"]; 
    let mrt=data["data"]["mrt"];
    attractionInfo.textContent = category +" at "+ mrt;

    let description=document.querySelector(".description");
    let descriptionText= data["data"]["description"]; 
    description.textContent=descriptionText

    let address=document.querySelector(".address");
    let addressText=data["data"]["address"]; 
    address.textContent=addressText;

    let transportation=document.querySelector(".transportation");
    let transportationText=data["data"]["transport"]; 
    transportation.textContent=transportationText;
}


//------- 檢查登入狀態+取得行程資料 ------- 

let bookingForm = document.querySelector(".booking-form");

bookingForm.addEventListener("submit", function(event){
    event.preventDefault();
    fetch(`/api/user/auth`, {
    method: "GET",
    })
    .then((response) => response.json())
    .then((data) => {
        let memberData = data["data"];
        // console.log(memberData);
        if (memberData !== null) {
            let url=window.location.href
            let attraction_id =url.split("/attraction/")[1];
            // console.log(attraction_id);

            let date = document.querySelector("#choose_date").value;
            // console.log(date)

            // let attractionTime = document.querySelector(".price").attractionTime;
            // console.log(attractionTime);
            let attractionTime = document.querySelector('input[name="time"]').value;
            // console.log(attractionTime);

            let price = document.querySelector(".price").innerText;
            // console.log(price)
            let bookingInfo = {
            attraction_id: attraction_id,
            date: date,
            time: attractionTime,
            price: price,
            };
            // console.log(bookingInfo)
            fetch(`/api/booking`, {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json" }),
                body: JSON.stringify(bookingInfo)
            })
            .then((response) => response.json())
            .then((data) => {
                window.location.href = "/booking";
            });
        } else {
            showSignin();
        }
    });
});


//------- 設定只能預訂今天以後的日期 ------- 

let date = new Date();
// console.log(date);
// console.log(date.getDate()); // 來取得日期。
// console.log(date.getMonth()); // 來取得月份，月份是從0開始，所以+1的話才會得到正確的月份。
// console.log(date.getFullYear()); // 來取得年份。

let chooseDate = document.querySelector("#choose_date");
let currentDate =date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
// console.log(currentDate);

let minDate =date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate()+1); 
// console.log(minDate);
chooseDate.min= minDate;
