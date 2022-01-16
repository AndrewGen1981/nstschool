//  ***     main objects    ***
//  student Obj, keeps all student's data, fills in after login
let stObj = {}



// stObj working tools
function getStudentData(getAction, stObjKey, func, rest="") {  // all cases getter
    
    try {
        fetch(`${servURL}?action=${getAction}&email=${sessionStorage.getItem("StudentServerLoggedIn")}${rest}`)
        .then(res => res.json())
        .then(res => {
            if (res != false) { 
                stObj[stObjKey] = res
                func()
            }
        })
    } catch(err) { console.log(err) }

}


//  Global Vars
const email = document.getElementById("signEmail")
const passw = document.getElementById("signPassword")

//  DOM sections
const singBox = document.getElementById("singBox")
const accountBox = document.getElementById("accountBox")


// setInterval data
let timer
const sessionCheckFreq = 30000


function ifLoggedIn() {
    if (sessionStorage.getItem("StudentServerLoggedIn") === null) {
        return undefined
    }
    return setInterval(() => {     //  setting timer for checking a session status

        try {
            fetch(`${servURL}?action=sessionStatus&email=${sessionStorage.getItem("StudentServerLoggedIn")}`)
            .then(res => res.json())
            .then(res => {
                if (res === false) {
                    logOut()
                }
            })
        } catch(err) { console.log(err) }

    }, sessionCheckFreq)  //  30000 - once in 30 sec
}


function logOut() {
    sessionStorage.removeItem("StudentServerLoggedIn")
    sessionStorage.removeItem("scheduleKey")
    showLogInBlock()
    clearInterval(timer)
}


function showLogInBlock() {
    email.value = ""
    passw.value = ""
    singBox.style.display = "flex"
    accountBox.style.display = "none"
}


function showAccountBlock() {
    singBox.style.display = "none"

    // showing the loading spinner
    document.querySelector(".spinnerBox").style.display = "flex"
    
    getStudentData("studentArea", "stArea", () => {
        if (stObj.stArea != undefined) {
            if (stObj.stArea.isApp) {
                document.getElementById("statusApp").classList.add('passed')
            } 
            if (stObj.stArea.isAgr) {
                document.getElementById("statusAgr").classList.add('passed')
            } 
            if (stObj.stArea.isCol) {
                document.getElementById("statusCol").classList.add('passed')
            }

            if (stObj.stArea.isApp && stObj.stArea.isAgr && stObj.stArea.isCol) {
                // all forms are done, closing prefill section
                document.getElementsByClassName("formsTitle")[0].textContent = "You've already filled out all necessary forms. Thank you"
                document.getElementsByClassName("formsContainer")[0].style = "display: none;"
            }

        }
    })

    getStudentData("studentList", "stList", () => {
        if (stObj.stList != undefined) {
            if (stObj.stList.data != undefined) {

                if (stObj.stList.data === false) {
                    document.getElementsByClassName("generalTitle")[0].textContent = "Hello"
                    document.getElementsByClassName("generalSubTitle")[0].textContent = "New Student"
                    // new student, activating Enroll section
                    document.getElementsByName('enroll')[0].click()
                }
                
                if (stObj.stList.data.status === "ok") {
                    // console.log(stObj.stList.data)

                    // saving key into Storage, this key is used for scheduling
                    let nameKey = `${stObj.stList.data.FullName},${stObj.stList.data.Key}`
                    sessionStorage.setItem("scheduleKey", nameKey)
                    // showing schedule for signed student
                    refreshAllSchedules()

                    
                    document.getElementsByClassName("generalTitle")[0].textContent = "Hello,"
                    document.getElementsByClassName("generalSubTitle")[0].textContent = stObj.stList.data.FullName
                    if (stObj.stList.data.OnlineTraining) {
                        document.getElementById("statusOnline").classList.add('passed')
                    }

                    const testSVGs = document.getElementById("testDetails").getElementsByTagName("svg")

                    if (stObj.stList.data.InCabBrakeTEST != "" &&
                        stObj.stList.data.OutsideTEST != "") {
                            if (stObj.stList.data.InCabBrakeTEST === "passed" &&
                                stObj.stList.data.OutsideTEST === "passed") {
                                    document.getElementById("statusPreTest").classList.add('passed')
                            } else {
                                document.getElementById("statusPreTest").classList.add('failed')
                            }
                    }

                    if (stObj.stList.data.ParallelParkingTEST != "" &&
                        stObj.stList.data.DegrParkingTEST != "") {
                            if (stObj.stList.data.ParallelParkingTEST === "passed" &&
                                stObj.stList.data.DegrParkingTEST === "passed") {
                                    document.getElementById("statusBackingTest").classList.add('passed')
                            } else {
                                document.getElementById("statusBackingTest").classList.add('failed')
                            }
                    }

                    if (stObj.stList.data.InCabBrakeTEST === "passed") { testSVGs[0].style = "fill: var(--good);" }
                    if (stObj.stList.data.InCabBrakeTEST === "failed") { testSVGs[1].style = "fill: var(--bad);" }                  

                    if (stObj.stList.data.OutsideTEST === "passed") { testSVGs[2].style = "fill: var(--good);" }
                    if (stObj.stList.data.OutsideTEST === "failed") { testSVGs[3].style = "fill: var(--bad);" } 

                    if (stObj.stList.data.ParallelParkingTEST === "passed") { testSVGs[4].style = "fill: var(--good);" }
                    if (stObj.stList.data.ParallelParkingTEST === "failed") { testSVGs[5].style = "fill: var(--bad);" }

                    if (stObj.stList.data.DegrParkingTEST === "passed") { testSVGs[6].style = "fill: var(--good);" }
                    if (stObj.stList.data.DegrParkingTEST === "failed") { testSVGs[7].style = "fill: var(--bad);" }

                    if (stObj.stList.data.CityDrivingTEST === "passed") { 
                        document.getElementById("statusCityTest").classList.add('passed')
                        testSVGs[8].style = "fill: var(--good);" 
                    }
                    if (stObj.stList.data.CityDrivingTEST === "failed") {
                        document.getElementById("statusCityTest").classList.add('failed')
                        testSVGs[9].style = "fill: var(--bad);"
                    }

                  
                    //  working with List Data
                    const stList = document.getElementById("stList")
                    const stMain = stList.getElementsByClassName("mainDataTitle")

                    stMain[0].textContent = `ID# ${stObj.stList.data.Key}`
                
                    if (stObj.stList.data.StatusAR === "paid") {
                        stMain[1].textContent = `100% ${stObj.stList.data.StatusAR}`
                        stMain[2].textContent = "no debt"
                    } else {
                        stMain[1].textContent = `${Math.round(stObj.stList.data.StatusAR*1000)/10}% paid`
                        stMain[2].textContent = `$${-stObj.stList.data.Stillowes} debt`
                    }

                    // working with TTT, converting date to duration if not 0
                    if (stObj.stList.data.TotalHours === "1899-12-30T08:00:00.000Z") {
                        stMain[3].textContent = `TTT 0h:0m`
                    } else {
                        let date = new Date(stObj.stList.data.TotalHours)
                        let timeZoneDiff = Math.round(date.getTimezoneOffset()/60) - 8  // correction on Seattle yime zome GTM-08
                        
                        stMain[3].textContent = `TTT ${((date.getDate()+1)*24 + date.getHours() + timeZoneDiff).toString() +"h:"+ date.getMinutes().toString() +"m"}`
                    }

                    const mainDataList = stList.getElementsByClassName("mainDataList")

                    mainDataList[0].textContent = stObj.stList.data.CourseorProgram
                    mainDataList[1].textContent = stObj.stList.data.Transmissiontype

                    if (stObj.stList.data.TuitionStartDate != "") {
                        mainDataList[2].textContent = new Date(stObj.stList.data.TuitionStartDate).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })
                    } else {   mainDataList[2].textContent = "-"   }

                    if (stObj.stList.data.TuitionEndDate != "") {
                        mainDataList[3].textContent = new Date(stObj.stList.data.TuitionEndDate).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })
                    } else {   mainDataList[3].textContent = "-"   }

                    
                    mainDataList[4].textContent = stObj.stList.data.ProgramEnrollmentStatus
                    mainDataList[5].textContent = stObj.stList.data.FullTimePartTime != "" ? stObj.stList.data.FullTimePartTime : "no data"

                    mainDataList[6].textContent = stObj.stList.data.CourcesProgress != "" ? Math.round(stObj.stList.data.CourcesProgress*1000)/10+"%" : "no data"
                    mainDataList[7].textContent = stObj.stList.data.QuizProgress != "" ? Math.round(stObj.stList.data.QuizProgress*1000)/10+"%" : "no data"
                    mainDataList[8].textContent = stObj.stList.data.TotalProgress != "" ? Math.round(stObj.stList.data.TotalProgress*1000)/10+"%" : "no data"
                    
                } //  stObj.stList.data.status === "ok"
            }
            if (stObj.stList.expul != undefined) {
                if (stObj.stList.expul.status === "ok") {
                    // console.log(stObj.stList.expul)

                    let last3month = []
                    Object.keys(stObj.stList.expul).forEach(key => {
                        if (stObj.stList.expul.hasOwnProperty(key)) {
                            if (key.indexOf("Timesvisitedat") > -1){
                                last3month.push(key.replace("Timesvisitedat", ""))
                            }
                        }
                    });

                    const monthList = document.getElementsByClassName("-month")
                    monthList[0].textContent = last3month[0]
                    monthList[1].textContent = last3month[1]
                    monthList[2].textContent = last3month[2]

                    const expulWorkList = document.getElementsByClassName("expulWork")
                    expulWorkList[0].textContent = `${stObj.stList.expul['Timesvisitedat'+last3month[0]]} day(s)`
                    expulWorkList[1].textContent = `${stObj.stList.expul['Timesvisitedat'+last3month[1]]} day(s)`
                    expulWorkList[2].textContent = `${stObj.stList.expul['Timesvisitedat'+last3month[2]]} day(s)`

                    let solid = "-"
                    if (stObj.stList.expul.Daysoff != "") { solid = "3 days off" }
                    if (stObj.stList.expul.Daysoff1 != "") { solid = "7 days off" }
                    if (stObj.stList.expul.Daysoff2 != "") { solid = "14 days off" }
                    if (stObj.stList.expul.Daysoff3 != "") { solid = "30 days off" }
                    expulWorkList[3].textContent = solid
                    if (solid.toString() != "-") { expulWorkList[3].style = "color: var(--bad);" }

                    
                    if (stObj.stList.expul.SMSSent != "0" &&
                        stObj.stList.expul.SMSSent != "") { 
                        expulWorkList[4].textContent = `${stObj.stList.expul.SMSSent} time(s)`
                        expulWorkList[4].style = "color: var(--bad);"
                    } else {
                        expulWorkList[4].textContent = "was not sent"
                    }

                    if (stObj.stList.expul.Dismissalssent != "0" &&
                        stObj.stList.expul.Dismissalssent != "") { 
                        expulWorkList[5].textContent = `${stObj.stList.expul.Dismissalssent} time(s)`
                        expulWorkList[5].style = "color: var(--bad);"
                    } else {
                        expulWorkList[5].textContent = "was not sent"
                    }
                } //    stObj.stList.expul.status === "ok"
            }

            // hidding spinner and showing account box
            document.querySelector(".spinnerBox").style.display = "none"
            accountBox.style.display = "flex"

        }   //  list != undefined
    })  //  getSudentData (stList)

    
    const evalVALs = document.getElementById("evalDetails").getElementsByClassName("test_eval_title")

    getStudentData("drivingSchedule", "schedule", () => {
        if (stObj.schedule != undefined) {
            if (stObj.schedule.status === "ok") {
                // console.log(stObj.schedule)

                if (stObj.schedule.PretripEvaluation > 0) {
                    evalVALs[1].textContent = stObj.schedule.PretripEvaluation
                }
                if (stObj.schedule.PretripEvaluation1 > 0) {
                    document.getElementById("statusCert1").classList.add('passed')
                }

                if (stObj.schedule.BackingEvaluation > 0) {
                    evalVALs[3].textContent = stObj.schedule.BackingEvaluation
                }
                if (stObj.schedule.BackingEvaluation1 > 0) {
                    document.getElementById("statusCert2").classList.add('passed')
                }

                if (stObj.schedule.CityEvaluation > 0) {
                    evalVALs[5].textContent = stObj.schedule.CityEvaluation
                }
                if (stObj.schedule.CityEvaluation1 > 0) {
                    document.getElementById("statusCert3").classList.add('passed')
                }

                if (stObj.schedule.preTest) { document.getElementById("statusGrad1").classList.add('passed') }
                if (stObj.schedule.TPE) { document.getElementById("statusGrad2").classList.add('passed') }
                if (stObj.schedule.reTest) { document.getElementById("statusGrad3").classList.add('passed') }

                const limitsList = document.getElementsByClassName("limitsList")

                // hould start from 1, 0 is dummy
                limitsList[1].textContent = stObj.schedule.AvailableinStrCombBackingList ? "Yes" : "No"
                limitsList[1].style = stObj.schedule.AvailableinStrCombBackingList ? "color: var(--good);" : "color: var(--bad);"

                limitsList[2].textContent = stObj.schedule.AvailableinDegBackingList ? "Yes" : "No"
                limitsList[2].style = stObj.schedule.AvailableinDegBackingList ? "color: var(--good);" : "color: var(--bad);"

                limitsList[3].textContent = stObj.schedule.AvailableinCityList ? "Yes" : "No"
                limitsList[3].style = stObj.schedule.AvailableinCityList ? "color: var(--good);" : "color: var(--bad);"

                const schTable = document.getElementById("schTable").getElementsByTagName("td")     //  should be 5X5 table

                let backingStr = [stObj.schedule.StraightBacking, stObj.schedule.StraightBacking1, stObj.schedule.StraightBacking3]
                let backing90 = [stObj.schedule.DegreeBacking, stObj.schedule.DegreeBacking1, stObj.schedule.DegreeBacking3]
                let backingComb = [stObj.schedule.CombinationBacking, stObj.schedule.CombinationBacking1, stObj.schedule.CombinationBacking3]
                let cityDrv = [stObj.schedule.CityDriving, stObj.schedule.CityDriving1, stObj.schedule.CityDriving3]

                let totals = []

                for (let i=0; i< backingStr.length; i++) {

                    schTable[i+1].textContent = backingStr[i]
                    schTable[i+1+backingStr.length+2].textContent = backing90[i]
                    schTable[i+1+2*(backingStr.length+2)].textContent = backingComb[i]
                    schTable[i+1+3*(backingStr.length+2)].textContent = cityDrv[i]
                    schTable[i+1+4*(backingStr.length+2)].textContent = backingStr[i] + backing90[i] + backingComb[i] + cityDrv[i]
                    totals.push(backingStr[i] + backing90[i] + backingComb[i] + cityDrv[i])

                }

                let total = 0
                backingStr.map(a => { total += parseInt(a) })
                schTable[4].textContent = total
                schTable[4].style = "color: var(--calm);"

                total = 0
                backing90.map(a => { total += parseInt(a) })
                schTable[9].textContent = total
                schTable[9].style = "color: var(--calm);"

                total = 0
                backingComb.map(a => { total += parseInt(a) })
                schTable[14].textContent = total
                schTable[14].style = "color: var(--calm);"

                total = 0
                cityDrv.map(a => { total += parseInt(a) })
                schTable[19].textContent = total
                schTable[19].style = "color: var(--calm);"

                total = 0
                totals.map(a => { total += parseInt(a) })
                schTable[24].textContent = total
                schTable[24].style = "color: var(--calm);"



                //  using stObj.schedule.stObjStudentNameKey to build GET ruquest
                //  in order to get personal scheduling data
                getStudentData("schTable", "schTable", () => {
                    

                    if (stObj.schTable != undefined) {
                        if (stObj.schTable.status === "ok") {
                            let appointList = stObj.schTable.schNameKeys

                            let html = ""
                            for (let i=0; i<appointList.length; i++) {
                                let date = new Date(appointList[i][0]).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })
                                let time = new Date(appointList[i][1]).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })
                                html += `<tr>
                                    <td>${date}</td>
                                    <td style="text-align:right;">${time}</td>
                                    <td>${appointList[i][3]}</td>
                                    <td>${appointList[i][4]}</td>
                                    <td>${appointList[i][5]}</td>
                                </tr>`
                            }   //  for (let i=0; i<appointList.length; i++)

                            if (html != "") {
                                document.getElementById("appintQty").textContent = appointList.length
                                document.getElementById("appintQty").style = "color: var(--good);"

                                document.getElementById("schAppointTable").innerHTML = 
                                `<th>Date</th>
                                <th>Time</th>
                                <th>Course</th>
                                <th>Location</th>
                                <th>Instructor</th>
                                ${html}`
                            }   //  html != ""


                        }   //  stObj.schTable.status === "ok"
                    }   //  stObj.schTable != undefined
                }, `&nameKey=${stObj.schedule.StudentNameKey}`)    // getStudentData("schTable", "schTable"

                

            }   //  stObj.schedule.status === "ok"
        }
    })  //  getStudentData Scheduling

    

}




//  **********   ENTRY Point     **********
if (sessionStorage.getItem("StudentServerLoggedIn") != null) {
    showAccountBlock()
    if (timer === undefined || timer === null) {
        timer = ifLoggedIn()  //  checking session once in 30 sec
    }
} else { logOut() }



//  ********** Overwriting form's default event listener ********** 

// for logIn
document.getElementById("singInForm").addEventListener("submit", e => {
    e.preventDefault()

    const params = `?action=login&email=${email.value}&passw=${passw.value}`
    
    fetch(servURL+params)
    .then(res => res.json())
    .then(res => {
        if (res.status === "Ok") {
            sessionStorage.setItem("StudentServerLoggedIn", email.value)
            showAccountBlock()
            timer = ifLoggedIn()  //  checking session once in 30 sec
        } else {
            alert(res.status)
        }
    })

})


// for create account
document.getElementById("createAccount").addEventListener("click", e => {
    e.preventDefault()

    if (email.value === "" || passw.value ==="") {
        alert ("Email address and password fields should not be blank")
        return
    }

    server_doPOST_({
        action: "verifyEmail",
        stEmail: email.value,
        stPassw: passw.value,
        backlink: servURL
    })

    alert(`Thank you. We've sent you a confirmation email to ${email.value}. Please check it out.\nIf you'll not receive an email, then maybe you misstype with email or we already have such user, please try again or get in touch with us 253.210.0505`)

})


// forgot email or password section
document.getElementsByClassName("forgot-email")[0].addEventListener("click", e => {
    e.preventDefault()
    alert("Check your Tuition Agreement, email, you've registered with, is inside the Agreement. Commonly it is the one, if not - let us know 253.210.0505")
})

document.getElementsByClassName("forgot-password")[0].addEventListener("click", e => {
    e.preventDefault()
    if (email.value === "") {
        alert ("Email address should not be blank, we are about sending you your password")
        return
    }

    server_doPOST_({
        action: "forgotPassword",
        stEmail: email.value,
	    backlink: servURL
    })

    alert(`If you are registered, then your password will be send to ${email.value}`)
})
