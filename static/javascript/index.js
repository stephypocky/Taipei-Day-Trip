let ct = 0; //設定變數 ct (count)=0
let keyword = "";
let nextPage = 0;
let keyword_value = "";

const options = {
    root: null, //沒有指定就指windows
    rootMargin: "1px",
    threshold: 0.5,
};

let observer = new IntersectionObserver(callback, options);
let target = document.querySelector("#footer");
observer.observe(target);

function callback(entry) {
    if(entry[0].isIntersecting) {
        ct += 1; // ct ++
        if(ct>1){
            allAttra(keyword_value);
            observer.unobserve(target);
        }
    }
}

allAttra(keyword);
searchCategory();

let keyword_btn = document.querySelector(".search-btn")
keyword_btn.addEventListener("click" ,() =>{
    keyword_value=document.querySelector(".search-input").value;
    document.querySelector("#content").innerHTML="";
    nextPage = 0;
    allAttra(keyword_value);
    observer.unobserve(target); //把 observe 關起來，不然 load 完有 keyword 的第0頁後，會再 load 到沒有 keyword 的第0頁
})


let searchInput = document.querySelector(".search-input");
let categoryBox = document.querySelector(".category-box");

searchInput.addEventListener("click", function(){
    categoryBox.style.opacity="1";
    categoryBox.style.visibility="visible"
    document.addEventListener('click', function categoryRemove(event) {
        let showCategory = document.querySelector(".search-input");
        let categoryBox = document.querySelector(".category-box");
        if (!showCategory.contains(event.target)) {
            categoryBox.style.opacity = '0';
            categoryBox.style.visibility = 'hidden';
            document.removeEventListener("click", categoryRemove);
            if(categoryBox.contains(event.target)){
                let html = event.target.innerHTML   
                if(!html.trim().startsWith("<!--")){
                    showCategory.value= event.target.textContent;
                }
            }
        }; 
    });
});

function searchCategory(){
    fetch("/api/categories")
    .then((response) => response.json())
    .then((data) => { 
        data = data["data"]
        for(let i=0; i<(data.length); i++){
            let categoryBox=document.querySelector(".category-box");
            let categoryDiv = document.createElement("DIV");
            categoryDiv.setAttribute("class", "category-div");
            categoryBox.appendChild(categoryDiv);

            let categoryText=document.createTextNode((new String(data[i])));
            categoryDiv.appendChild(categoryText);
        }
    });
};
 

function allAttra(keyword) {
    if(keyword){
        url=`/api/attractions?page=${nextPage}&keyword=${keyword_value}` //抓 keyword 景點資料
    }else{
        url=`/api/attractions?page=${nextPage}` //抓全部景點資料
    }
    fetch(url)
    .then((response) => response.json())
    .then((data) => { 
        let content = document.querySelector("#content");
 
        if(data["data"].length==0){ 
            let nodataDiv= document.createElement("DIV");
            nodataDiv.setAttribute("class", "nodata-div");
            // outerDiv.appendChild(nodataDiv);
            content.appendChild(nodataDiv);

            let noData=document.createTextNode("無景點資料");
            nodataDiv.appendChild(noData);
            return;
        }

        if(nextPage != null){
            for(let i=0; i<(data["data"].length); i++){

                let content = document.querySelector("#content");

                let attraAll = document.createElement("a");
                attraAll.setAttribute("class", "attra-all");
                attraAll.setAttribute("href", `/attraction/${data["data"][i]["id"]}`)
                content.appendChild(attraAll);

                let imgBox = document.createElement("DIV");
                imgBox.setAttribute("class", "img");
                // imgBox.setAttribute("src", new String((data["data"][i]["images"][0])));
                imgBox.style.cssText = `background-image: url('${data["data"][i]["images"][0]}')`
                attraAll.appendChild(imgBox);
            
        
                let nameBox = document.createElement("DIV");
                nameBox.setAttribute("class", "attra-name");
                attraAll.appendChild(nameBox);
            
                let name= document.createTextNode((new String(data["data"][i]["name"])));
                nameBox.appendChild(name);
        
                let attraSub = document.createElement("DIV");
                attraSub.setAttribute("class", "attra-sub");
                attraAll.appendChild(attraSub);

                let mrtBox = document.createElement("DIV");
                mrtBox.setAttribute("class", "mrt");
                attraSub.appendChild(mrtBox);

                let mrt=document.createTextNode((new String(data["data"][i]["mrt"])));
                mrtBox.appendChild(mrt);
    

                let categoryBox = document.createElement("DIV");
                categoryBox.setAttribute("class", "category");
                attraSub.appendChild(categoryBox);

                let category=document.createTextNode((new String(data["data"][i]["category"])));
                categoryBox.appendChild(category);
            };
            nextPage = data["nextPage"];

            if(nextPage === null){
                observer.unobserve(target);
                return;
            }
            observer.observe(target); //再把observe打開，不然load不到有keyword的下一頁
        }
    });
};
 


