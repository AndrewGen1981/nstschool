const URL = "https://script.google.com/macros/s/AKfycbygH0X1VZKFZhz2CbQeKnUzMS1ZSM_jin74Dse9pnEvo0GYmSPvIRROo5uxOLKL65U/exec"


function writeData(formData) {
    fetch(URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify({
            action: "waitList",
            data: formData
        })
    })
}   // writeData


document.querySelector(".contact-form").addEventListener("submit", (e) => {
    // when clicking Submit
    e.preventDefault()

    const data = [new Date()]
    let name = document.querySelector("#fn").value  //  have to save, because form will be creared in moment

    function getInputChilds(elements) {        //  recursive func!!!
        for (let i=0; i<elements.length; i++) {
            if (elements[i].nodeName === 'INPUT' ||
                elements[i].nodeName === 'TEXTAREA' ||
                elements[i].nodeName === 'SELECT' ||
                elements[i].nodeName === 'CHECK') {
                // saving even blank values
                data.push(elements[i].value)
                elements[i].value = ''
            } else {
                if (elements[i].children.length > 0) {
                    getInputChilds(elements[i].children)     //  recursion
                }
            }
        }
    }       // getInputChilds

    getInputChilds(e.target.children)
    writeData(data)     // don't wait for response, because of POST
    clearAllCheckBoxes()    //  clearing all my check boxes
    alert(`Data has been passed to NSTS. Thank you ${name}, for your time.`)

})  // .contact-form").addEventListener


const checks = document.querySelectorAll(".form-check-box")     //  all my check boxes

// adding eventlisteners for my check boxes
for (let i=0; i<checks.length; i++) {
    checks[i].addEventListener("click", (e) => {
        if (!checks[i].classList.contains("-checked")) {
            checks[i].classList.add("-checked")
            checks[i].value = checks[i].id
        } else {
            checks[i].classList.remove("-checked")
            checks[i].value = ""
        }
    })
}


function clearAllCheckBoxes() {
    // clear all my check boxes
    for (let i=0; i<checks.length; i++) {
        checks[i].classList.remove("-checked")
    }
}


document.querySelector(".contact-form").addEventListener("reset", (e) => {
    // all default action plus clearAllCheckBoxes
    clearAllCheckBoxes()
})