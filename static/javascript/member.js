const signin = document.querySelector(".signin");
const signup = document.querySelector(".signup");
const blackShadow = document.querySelector(".black-shadow");

userStatus();

// ------- 點擊 登入/註冊，跳出登入頁面 -------

function showSignin(){
    signin.style.display= "block";
    blackShadow.style.display = "block";
};

// ------- 點擊 x，關閉登入頁面 -------

function closeSignin() {
    let signinemail = document.querySelector(".signin-email");
    let signinpassowrd = document.querySelector(".signin-password");

    signin.style.display= "none";
    blackShadow.style.display = "none";
    signinemail.value="";
    signinpassowrd.value="";
};

// ------- 點擊 x，關閉註冊頁面 -------

function closeSignup() {
    let username = document.getElementsByName("username")[0];
    let email = document.getElementsByName("email")[1];
    let password = document.getElementsByName("password")[1];

    signup.style.display = "none";
    blackShadow.style.display = "none";
    username.value = "";
    email.value = "";
    password.value = "";
};

// ------- 登入成功後，註冊和登入表格都關閉 -------
function closeBothForm(){
    signin.style.display= "none";
    signup.style.display = "none";
};

// ------- 點擊 註冊，跳轉註冊頁面 -------

function directSignup(){
    signup.style.display = "block";
    signin.style.display = "none";
};

// ------- 點擊 點此登入，跳轉登入頁面 ------- 

function directSignin(){
    signup.style.display = "none";
    signin.style.display = "block";
}

//--------- navbar 預定行程  ------
let navBooking = document.querySelector("#navbooking");
let cookie = document.cookie;
// console.log(cookie)
function connectBooking() {
	if (cookie == '') {
		showSignin();
	} else {
		location.href = '/booking';
	}
}


// ------- 註冊 ------- 

const signupFrom = document.querySelector(".signup-form")

signupFrom.addEventListener("submit", function(event) {
    event.preventDefault(); //event.preventDefault(), Clicking on a "Submit" button, prevent it from submitting a form
    // console.log("123");
    let username = document.getElementsByName("username")[0];
    let email = document.getElementsByName("email")[1];
    let password = document.getElementsByName("password")[1];

    // let emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    // if (emailRule.test(email) != true){
    //     let failSignin = document.querySelector(".fail-signin");
    //     failSignin.innerHTML="data.message";
    // }   

    let data= {
        username: username.value,
        email: email.value,
        password: password.value,
    };
    // console.log(data)
    fetch(`/api/user`,{
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(data), 
    })
    .then((response) => response.json())
    .then((data) => {
        if("ok" in data){
            let successSignup = document.querySelector(".success-signup");
            successSignup.style.display = "block";
            username.value = "";
            email.value = "";
            password.value = "";
            setTimeout(()=>{
                successSignup.style.display = "none";
            },2000)
        } else {
            let failSignup = document.querySelector(".fail-signup");
            failSignup.innerHTML=data.message;
            setTimeout(()=>{
                failSignup.innerHTML="";
            },2000)
        }
    });
})
     
// ------- 登入 ------- 
 
const signinForm = document.querySelector(".signin-form")

signinForm.addEventListener("submit", function(event) {
    event.preventDefault();
    let signinemail = document.querySelector(".signin-email").value;
    // console.log(signinemail)
    let signinpassowrd = document.querySelector(".signin-password").value;
    // console.log(signinpassowrd)
    let data= {
        email: signinemail,
        password: signinpassowrd,
    };
    fetch(`/api/user`, {
        method: "PUT",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(data), 
        
    })
    .then((response) => response.json())
    .then((data) => {
        if("ok" in data){
            closeBothForm();
            window.location.reload();
        } else {
            let failSignin = document.querySelector(".fail-signin");
            failSignin.innerHTML=data.message;
            setTimeout(()=>{
                failSignin.innerHTML="";
            }, 2000)
        }
    });
});

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
}


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
            window.location.reload();
        }
    });
}   


