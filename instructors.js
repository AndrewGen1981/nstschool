//  Global instr Object
let instObj = {}

//  ********** Overwriting form's default event listener ********** 

// for logIn
document.getElementById("singInForm").addEventListener("submit", e => {
    e.preventDefault()
    
    const params = `?action=instrlogin&email=${document.getElementById("instSignEmail").value}&passw=${document.getElementById("instSignPassword").value}`
    
    try {
        fetch(servURL + params)
        .then(res => res.json())
        .then(res => {

            console.log(res)

            if (res.status === "OK") {

                //   entered correct inst. credentials
                //  clearning form fields
                document.getElementById("instSignEmail").value = ""
                document.getElementById("instSignPassword").value = ""

                instObj = res
                switchOffSignBlock()
            } else {
                alert(res.status)
            }
        })
    } catch (err) {
        console.log("loging error: ")
        console.log(err)
    }
    

})



function switchOffSignBlock() {
    //  switches off sign in block & shows one for signed

    if (instObj.status === undefined) { return false }
    if (instObj.status != "OK") { return false }

    document.getElementById("singInForm").style = "display: none;"  //  off inst.sign form
    document.getElementById("instBlock").style = "display: flex;"  //  on inst.block

    // filling out with OBJ data
    document.getElementById("instName").textContent = instObj.instructor != undefined ? `Hi, ${instObj.instructor}!` : "Ooops, try to sign in one more time please"
    document.getElementById("instSchedileOf").textContent = instObj.schedule != undefined ? `you are assigned to ${instObj.schedule}'s schedule` : ""
    

}
