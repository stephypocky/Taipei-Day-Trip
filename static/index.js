let ct = 0; //設定變數 ct (count)=0
let keyword = "";
let page = 0;
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
        // console.log(ct)
        if(ct>1){
            allAttra(keyword_value);
        }
    }
}

let keyword_btn = document.querySelector(".search-btn")
keyword_btn.addEventListener("click" ,() =>{
    keyword_value=document.querySelector(".search-input").value;
    document.querySelector("#content").innerHTML=""
    page = 0;
    allAttra(keyword_value)
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
            showCategory.value= event.target.textContent
        }
    }; 
    
    });

});

function searchCategory(){
    fetch("/api/categories")
    .then((response) => response.json())
    .then((data) => { 
        data = data["data"]
        // console.log(data[0])
        for(let i=0; i<(data.length); i++){
            let categoryBox=document.querySelector(".category-box");
            let categoryDiv = document.createElement("DIV");
            categoryDiv.setAttribute("class", "category-div");
            categoryBox.appendChild(categoryDiv)

            let categoryText=document.createTextNode((new String(data[i])));
            categoryDiv.appendChild(categoryText)
        }

    });

};
 

function allAttra(keyword) {
    if(keyword){
        url=`/api/attractions?page=${page}&keyword=${keyword_value}` //抓 keyword 景點資料
        // console.log(url)
    }else{
        url=`/api/attractions?page=${page}` //抓全部景點資料
    }
    fetch(url)
    .then((response) => response.json())
    .then((data) => { 
        let content = document.querySelector("#content");
        // let outerDiv=document.createElement("DIV");
        // outerDiv.setAttribute("class", "outer-div");
        // console.log(data["data"])
        if(data["data"].length==0){ 
            let nodataDiv= document.createElement("DIV");
            nodataDiv.setAttribute("class", "nodata-div");
            // outerDiv.appendChild(nodataDiv);
            content.appendChild(nodataDiv);

            let noData=document.createTextNode("無景點資料");
            nodataDiv.appendChild(noData);
        }
        if(data.nextPage == null){
            // console.log("last")
            for(let i=0; i<(data["data"].length); i++){
                
                let content = document.querySelector("#content");
            

                let attraAll = document.createElement("DIV");
                attraAll.setAttribute("class", "attra-all");
                content.appendChild(attraAll);
            

                let imgBox = document.createElement("IMG");
                imgBox.setAttribute("class", "img");
                imgBox.setAttribute("src", new String((data["data"][i]["images"][0])));
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
                
                // let attraAll = document.createElement("DIV");
                // attraAll.setAttribute("class", "attra-all");
                // outerDiv.appendChild(attraAll);

                // let imgBox = document.createElement("IMG");
                // imgBox.setAttribute("class", "img");
                // imgBox.setAttribute("src", new String((data["data"][i]["images"][0])));
                // attraAll.appendChild(imgBox);
            
        
                // let nameBox = document.createElement("DIV");
                // nameBox.setAttribute("class", "attra-name");
                // attraAll.appendChild(nameBox);
            
                // let name= document.createTextNode((new String(data["data"][i]["name"])));
                // nameBox.appendChild(name);
        
                // let attraSub = document.createElement("DIV");
                // attraSub.setAttribute("class", "attra-sub");
                // attraAll.appendChild(attraSub);

                // let mrtBox = document.createElement("DIV");
                // mrtBox.setAttribute("class", "mrt");
                // attraSub.appendChild(mrtBox);

                // let mrt=document.createTextNode((new String(data["data"][i]["mrt"])));
                // mrtBox.appendChild(mrt);
    

                // let categoryBox = document.createElement("DIV");
                // categoryBox.setAttribute("class", "category");
                // attraSub.appendChild(categoryBox);

                // let category=document.createTextNode((new String(data["data"][i]["category"])));
                // categoryBox.appendChild(category);
                };
            

                observer.unobserve(target);
                return //強制離開此 function allAttra()，不然就會繼續跑下個 if
            }
                if(page != null){
                    for(let i=0; i<(data["data"].length); i++){

                        let content = document.querySelector("#content");
                        // content.appendChild(attraAll);

                        let attraAll = document.createElement("DIV");
                        attraAll.setAttribute("class", "attra-all");
                        content.appendChild(attraAll);

                        let imgBox = document.createElement("IMG");
                        imgBox.setAttribute("class", "img");
                        imgBox.setAttribute("src", new String((data["data"][i]["images"][0])));
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

                        // let attraAll = document.createElement("DIV");
                        // attraAll.setAttribute("class", "attra-all");
                        // outerDiv.appendChild(attraAll);

                        // let imgBox = document.createElement("IMG");
                        // imgBox.setAttribute("class", "img");
                        // imgBox.setAttribute("src", new String((data["data"][i]["images"][0])));
                        // attraAll.appendChild(imgBox);
                    
                
                        // let nameBox = document.createElement("DIV");
                        // nameBox.setAttribute("class", "attra-name");
                        // attraAll.appendChild(nameBox);
                    
                        // let name= document.createTextNode((new String(data["data"][i]["name"])));
                        // nameBox.appendChild(name);
                
                        // let attraSub = document.createElement("DIV");
                        // attraSub.setAttribute("class", "attra-sub");
                        // attraAll.appendChild(attraSub);

                        // let mrtBox = document.createElement("DIV");
                        // mrtBox.setAttribute("class", "mrt");
                        // attraSub.appendChild(mrtBox);

                        // let mrt=document.createTextNode((new String(data["data"][i]["mrt"])));
                        // mrtBox.appendChild(mrt);
            

                        // let categoryBox = document.createElement("DIV");
                        // categoryBox.setAttribute("class", "category");
                        // attraSub.appendChild(categoryBox);

                        // let category=document.createTextNode((new String(data["data"][i]["category"])));
                        // categoryBox.appendChild(category);
        
                    };

                    // let content = document.querySelector("#content");
                    // content.appendChild(attraAll);



                        page = data["nextPage"];
                        observer.observe(target);//再把observe打開，不然load不到有keyword的下一頁

                    // console.log("12")
                }
    });

};
 
allAttra(keyword);
searchCategory();

