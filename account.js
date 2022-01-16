//  Builds all the ACCOUNT view 

const aMenu = document.getElementsByClassName("menu__item -tab")
const aGreenLines = document.getElementsByClassName("menu__item -visible")
const aBlocks = document.getElementsByClassName("accBlock")


function toggleItem(n, switcher) {
    if (switcher){
        aMenu[n].classList.add("_selected")
        aGreenLines[n].classList.add("-hghLine-selected")
        aBlocks[n].classList.remove("-block_hidden")
    } else {
        aMenu[n].classList.remove("_selected")
        aGreenLines[n].classList.remove("-hghLine-selected")
        aBlocks[n].classList.add("-block_hidden")
    }
}


for(let i=0; i<aMenu.length; i++){
    // Adding OnClick to Header Links
    aMenu[i].addEventListener("click", (e)=>{
        for(let j=0; j<aBlocks.length; j++){
            toggleItem(j, aMenu[i].getAttribute("name") === aBlocks[j].getAttribute("name"))
        }
    })
}


// pre-filled forms handling
const form1 = document.getElementById("form1")
const form2 = document.getElementById("form2")
const form3 = document.getElementById("form3")

const appCapa = document.getElementById("appCapa")
const enrCapa = document.getElementById("enrCapa")
const colCapa = document.getElementById("colCapa")

const formsInfo = document.getElementById("formsInfo")
const formsLinks = document.getElementById("formsLinks")
const link_box_info = document.getElementById("link-box-info")

let askingInterval

function timing_AskStudentArea() {
    // checks if pre-filled forms saved already
    try {
        fetch(`${servURL}?action=studentArea&email=${sessionStorage.getItem("StudentServerLoggedIn")}`)
        .then(res => res.json())
        .then(res => {

            if (link_box_info.textContent != "Now you can fill out below forms") {
                link_box_info.textContent = "Now you can fill out below forms"
            }

            if (res.isApp && res.isAgr && res.isCol) {
                clearInterval(askingInterval)
            }
            if (res.isCol && !colCapa.classList.contains("-capa_activated")) {
                // Collection form is filled out
                form1.removeAttribute('href')
                form1.classList.add("-link_activated")
                colCapa.classList.remove("-capa_inactive")
                colCapa.classList.add("-capa_activated")
                // on status page
                document.getElementById("statusCol").classList.add("passed")
            }
            if (res.isApp && !appCapa.classList.contains("-capa_activated")) {
                // Application is filled out
                form2.removeAttribute('href')
                form2.classList.add("-link_activated")
                appCapa.classList.remove("-capa_inactive")
                appCapa.classList.add("-capa_activated")
                // on status page
                document.getElementById("statusApp").classList.add("passed")
            }
            if (res.isAgr && !enrCapa.classList.contains("-capa_activated")) {
                // Agreement is filled out
                form3.removeAttribute('href')
                form3.classList.add("-link_activated")
                enrCapa.classList.remove("-capa_inactive")
                enrCapa.classList.add("-capa_activated")
                // on status page
                document.getElementById("statusAgr").classList.add("passed")
            }

        })
    } catch(err) { console.log(err) }
}



// Entry point
// highlighting Status Item
toggleItem(1, true)

// *** Script for Enrollment block ***



document.getElementById("preFillForm").addEventListener("submit", (event) => {

    const p = {
        firstName: document.getElementById('first_name').value.replace(/\s/g,"+"),
        lastName: document.getElementById('last_name').value.replace(/\s/g,"+"),
        middleName: document.getElementById('mid_name').value.replace(/\s/g,"+"),
        phone: document.getElementById('tel').value.replace(/\s/g,"+"),
        addrStreet: document.getElementById('street').value.replace(/\s/g,"+"),
        addrCity: document.getElementById('city').value.replace(/\s/g,"+"),
        addrState: document.getElementById('state').value.replace(/\s/g,"+"),
        addrPostal: document.getElementById('zip').value.replace(/\s/g,"+"),
    }

    let form1link = "https://docs.google.com/forms/d/e/1FAIpQLSfHc8bo1zc0q6aDMSRaH7-PrOkVP7n9Sjf4ojak64nrycFilQ/viewform?usp=pp_url"
    form1link += "&entry.1118861291="+p.firstName+"&entry.1072417552="+p.lastName+"&entry.821678090="+p.middleName+"&entry.1848937567="+p.phone
    form1link += "&entry.2121850589="+p.addrStreet+"&entry.80144118="+p.addrCity+"&entry.962977919="+p.addrState+"&entry.178452036="+p.addrPostal

    let form2link = "https://docs.google.com/forms/d/e/1FAIpQLSfNrJfAq2M1nhQCpD_j0UD0lhxcplyOzfgTCu-D1pWfvgVbtw/viewform?usp=pp_url"
    form2link += "&entry.1366783313="+p.firstName+"&entry.580283545="+p.lastName+"&entry.1588073682="+p.middleName+"&entry.1756260522="+p.phone
    form2link += "&entry.34535984="+p.addrStreet+"&entry.390924878="+p.addrCity+"&entry.1850553482="+p.addrState+"&entry.350264801="+p.addrPostal

    let form3link = "https://docs.google.com/forms/d/e/1FAIpQLSdacMu25n1WEXKg_6-gVua53e_HkIMd2ct_JA4L3WtGGRRpFw/viewform?usp=pp_url"
    form3link += "&entry.638696136="+p.firstName+"&entry.1489050319="+p.lastName+"&entry.1699471982="+p.middleName+"&entry.1582166305="+p.phone
    form3link += "&entry.1714184796="+p.addrStreet+"&entry.1836452421="+p.addrCity+"&entry.1641297709="+p.addrState+"&entry.221265397="+p.addrPostal

    form1.href =  form1link
    form2.href =  form2link
    form3.href =  form3link

    formsInfo.style.display='none'
    formsLinks.style.display='block'
    
    // starting checking function
    askingInterval = setInterval(timing_AskStudentArea, 5000)

    event.preventDefault()
})


document.getElementById("preFillForm").addEventListener("reset", (event) =>{
    form1.removeAttribute('href')
    form2.removeAttribute('href')
    form3.removeAttribute('href')
    formsInfo.style.display='block'
    formsLinks.style.display='none'
})
