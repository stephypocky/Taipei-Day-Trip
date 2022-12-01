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

function selectFee(){
    daytime.addEventListener("click", function(){
        bookingfee.textContent="2000";
    });

    nightime.addEventListener("click", function(){
        bookingfee.textContent="2500";
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