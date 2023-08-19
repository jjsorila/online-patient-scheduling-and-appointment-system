window.addEventListener("load", function(e) {
    $.fn.dataTableExt.sErrMode = "throw"
    const session = this.sessionStorage.getItem("session")
    if(!session){
        this.fetch("/login/logout", { method: "POST" })
        this.location.reload(true)
    }
})