// server URI
const scheduleURI = "https://script.google.com/macros/s/AKfycbwAv1H8zLWklnJPoRlcr6cnmQX-eR9Qub7y75wpt6BzToyEfNXza5yJ0n2PyFPIRPPnFQ/exec"
        
// array of all scheduling areas, used for init/refresh
const allScheduleRequests = [
    'onSubmitArea1',
    'onSubmitArea2',
    'onSubmitArea3',
    'onSubmitArea4',
    'onSubmitArea5',
    'onSubmitArea6'
]

let activeScheduleView = {}     //  viewed schedule
let allSchedules = []       //  array of objects, with all the responded schedules

let copyOfRequest = {}


function getSchedule(range, callback) {
    // getting schedule from GoogleApp and launching Callback func
    try {
        fetch(`${scheduleURI}?action=schedule&range=${range}`)
        .then(res => res.json())
        .then(async (res) => {
            if (res != false) { 
                await callback(res)
            }
        })
    } catch(err) { console.log(err) }
}

function checkScheduleLimits(range, student, callback_true, callback_false) {
    // checking schedule limits in GoogleApp and launching Callback func
    // student should be passed as 'student,key'
    try {
        fetch(`${scheduleURI}?action=scheduleLimits&range=${range}&student=${student}`)
        .then(res => res.json())
        .then(async (res) => {
            if (res != false) { 
                await callback_true(res)
            } else {
                if (callback_false != undefined) {
                    await callback_false(res)
                }
            }
        })
    } catch(err) { console.log(err) }
}


function writeSchedule(jsonOBJ) {
    //  sends POST requests to server to add/update appointments
    fetch(scheduleURI, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify(jsonOBJ)
    })

}


//  *** TOOLS for working with server response 

function extractGeneralInfo(info, infoHTML) {
    // inserting general info from respond to HTML 
    
    document.querySelector(".infoPrompt").classList.add("hide-prompt") //  hide animation

    info.map ((item, index) => {
        let div = document.createElement("section")
        div.id = `info${index}`
        div.textContent = item
        infoHTML.appendChild(div)
    })
}



function extractTimeLinesToGrid(lines, linesHTML) {
    // inserting time-lines from respond to HTML

    // inserting days
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    lines[0].map(day => {
        let div = document.createElement("section")
        div.classList.add("cal_day")

        let date = new Date (day)
        div.textContent = date instanceof Date && !isNaN(date.valueOf()) ? days[date.getDay()-1] : ""
        linesHTML.appendChild(div)
    })

    // inserting data lines
    let aDatestr = [], aTimestr //  used in data-attr setting
    
    lines.map ((line, i) => {
        // lines is 2D array
        let entireRowIsClosed = true    // want to know if entire row is closed
        let lastAddedTimeStamp

        line.map ((event, j) => {
            let div = document.createElement("section")
            
            if (i === 0) {
                //  first row with dates
                div.id = `date${j}`

                let date = new Date (event)
                if ( date instanceof Date && !isNaN(date.valueOf()) ) {
                    aDatestr.push(`${date.getMonth()+1}.${date.getDate()}`)
                    div.textContent = aDatestr[aDatestr.length-1]
                    div.classList.add("cal_date")
                } else { div.textContent = "" }
                
            } else {
                // row with data, not dates
                if (j === 0) {
                    // it's a timestamp
                    let date = new Date (event)
                    if ( date instanceof Date && !isNaN(date.valueOf()) ) {
                        div.id = `timeStamp${i}`
                        aTimestr = date.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' }).replace(':00 ', '')
                        div.textContent = aTimestr
                        div.classList.add("cal_timeStamp") 
                        lastAddedTimeStamp = div    //  saving link to current row's timestamp
                    } else { div.textContent = "---" }
                } else {
                    // it's an event
                    div.id = `event${i}-${j}`
                    div.classList.add("cal_event")

                    switch(event) {
                        case '':
                            entireRowIsClosed = false   //  at least one non-closed cell
                            div.classList.add("cal_event-free")
                            div.addEventListener("click", onClickFree)
                            // setting dataa attrs to specify next aadd requests
                            div.dataset.course = activeScheduleView.info[0][0]
                            div.dataset.alias = activeScheduleView.alias
                            div.dataset.date = aDatestr[j-1]
                            div.dataset.time = aTimestr
                            div.dataset.row = i
                            div.dataset.col = j
                            break
                        case 'closed':
                            div.classList.add("cal_event-closed")
                            break
                        case sessionStorage.getItem("scheduleKey"):
                            entireRowIsClosed = false   //  at least one non-closed cell
                            div.classList.add("cal_event-you")
                            div.addEventListener("click", onClickOccupiedByMe)
                            // setting data attrs to specify next add requests
                            div.dataset.course = activeScheduleView.info[0][0]
                            div.dataset.alias = activeScheduleView.alias
                            div.dataset.date = aDatestr[j-1]
                            div.dataset.time = aTimestr
                            div.dataset.row = i
                            div.dataset.col = j
                            break
                        default:
                            entireRowIsClosed = false   //  at least one non-closed cell
                            div.classList.add("cal_event-busy")
                    
                    }   // switch(event)
                }   // inner row content
            }   // row with data

            linesHTML.appendChild(div)

        })  // inner array map

        if (lastAddedTimeStamp != undefined && entireRowIsClosed) {
            lastAddedTimeStamp.classList.add("entireRowIsClosed")   //  assigning class to timeStamp nod
        }

    })  //  main array map

    linesHTML.style = `display: grid; grid-template-columns: repeat(${lines[0].length}, 1fr);`
}



function init_refreshSchedules_and_showOne(indexOfShown) {
    
    activeScheduleView = {}     //  initing active schedule
    allSchedules = []       //  initing all schedules' array

    const nav = document.querySelector(".cal_links")
    nav.innerHTML = ""

    // first of all getting the one which has to be shown
    getSchedule(allScheduleRequests[indexOfShown], (result) => {
        activeScheduleView = result //  this line should bo on top
        activeScheduleView.alias = allScheduleRequests[indexOfShown]    //  onSubmitArea1,2,3,4...
        activeScheduleView.index = indexOfShown     //  position in allScheduleRequests array, for refresh
        extractGeneralInfo(result.info[0], document.querySelector(".cal_info"))
        extractTimeLinesToGrid(result.data, document.querySelector(".cal_timeLine"))
        allSchedules.push(result)

        // checking if refresh was done after adding, then if it was successful
        if (!(Object.keys(copyOfRequest).length === 0
            && copyOfRequest.constructor === Object)) {
            
            // copyOfRequest is not empty, so this is refreshing after adding
            if (copyOfRequest.alias === activeScheduleView.alias) {
                // the same area, so check
                if (copyOfRequest.who != activeScheduleView.data[parseInt(copyOfRequest.row)][parseInt(copyOfRequest.col)]) {
                    if(confirm("Looks like your request was not handled yet, try to refresh again, if that not going to work, then just try add your appointment one more time or pick other timeframe. Do you want to refresh?")) {
                        refreshAllSchedules()
                    } else {
                        copyOfRequest = {}
                    }
                } else {    //  added ok, can clear copy
                    alert("Success, you appointment has been added!")
                    copyOfRequest = {}
                }
            }
        }

    })
    
    allScheduleRequests.map((schedule, index) => {
        if (index != indexOfShown) {   //  do not save shown again
            getSchedule(schedule, (result) => {
                allSchedules.push(result)
                allSchedules[allSchedules.length-1].alias = schedule
            })
        }
        // creating nav-bar
        let link = document.createElement("section")
        link.textContent = `schedule ${index+1}`
        link.classList.add("cal_link")
        if (index === indexOfShown ) { link.classList.add("-active_sch_link") }
        link.id = schedule
        link.dataset.index = index
        link.addEventListener("click", activateSchedule)
        link.style.setProperty('--anim_order_id', `${2*(index+1)}s`)
        nav.appendChild(link)
    })  //  allScheduleRequests.map

    // addint REFRESH-ALL item
    let link = document.createElement("section")
    link.textContent = "refresh-all"
    link.classList.add("cal_link")
    link.id = "refresh-all"
    link.dataset.index = -1
    link.addEventListener("click", refreshAllSchedules)
    nav.appendChild(link)

}   // function init_refreshSchedules_and_showOne



function activateSchedule(e) {
    // visualise a specific schedule on click on nav
    // schedule to view shuld be 'onSubmitArea1' type

    if (activeScheduleView.alias === e.target.id) { return }   // the same as visible

    const allNavs = document.querySelectorAll('.cal_link')
    for (let i=0; i<allNavs.length; i++) {
        
        if (allNavs[i].id === e.target.id) {
            allNavs[i].classList.add('-active_sch_link')
        } else { allNavs[i].classList.remove('-active_sch_link') }
    }

    allSchedules.map ((savedSchedule) => {
        if (savedSchedule.alias === e.target.id) {
            activeScheduleView = savedSchedule //  updating active
            activeScheduleView.index = allScheduleRequests.indexOf(savedSchedule.alias)    //  onSubmitArea1,2,3,4...
            document.querySelector(".cal_info").innerHTML = ""
            extractGeneralInfo(savedSchedule.info[0], document.querySelector(".cal_info"))
            
            document.querySelector(".cal_timeLine").innerHTML = ""
            extractTimeLinesToGrid(savedSchedule.data, document.querySelector(".cal_timeLine"))
        }
    })

}



function refreshAllSchedules() {
    // refreshes all schedules and shows active

    document.querySelector(".infoPrompt").classList.remove("hide-prompt") //  show animation
    if (Object.keys(activeScheduleView).length === 0
        && activeScheduleView.constructor === Object) {
        // if activeScheduleView is an empty object
        init_refreshSchedules_and_showOne(0)    //  then start with onSubmitArea1
    } else {
        document.querySelector(".cal_info").innerHTML = ""
        document.querySelector(".cal_timeLine").innerHTML = ""
        init_refreshSchedules_and_showOne(activeScheduleView.index)   
    }
}



//  *** onClick on free cells and update own
function onClickFree(e) {

    let me = sessionStorage.getItem("scheduleKey")
    if (me === undefined || me === null) {
        alert("Sign In again please")
        return
    }

    if (confirm(`Would you like to add an appointment for ${e.target.dataset.course} on ${e.target.dataset.date} at ${e.target.dataset.time}?`)) {
        // sending request to check student limits
        checkScheduleLimits(e.target.dataset.alias, me, (result) => {   // uses 2 callbacks. This is callback_true
            // when request about limits got back
            copyOfRequest = {   // saving copy to check if successfully added
                action: "addToScheduleFreeCell",
                course: e.target.dataset.course,
                alias: e.target.dataset.alias,
                row: e.target.dataset.row,
                col: e.target.dataset.col,
                who: me
            }
            writeSchedule(copyOfRequest)
            alert('Request sent. Let app few moments to refresh and check your reservation')
            refreshAllSchedules() // refreshes all schedules
        }, (result) => {    // callback_false
            alert(`You have exceeded the maximum number of appointments for the next 2 weeks for ${e.target.dataset.course} or you already have a certificate in this discipline. You can check your existing certificates in your online portal. Having a certificate means that your Instructor no longer sees the need for additional practice in ${e.target.dataset.course}, you are ready to move on. If you think that you still need practice in ${e.target.dataset.course}, please contact our managers and explain the situation.`)
        })
    }
}

function onClickOccupiedByMe(e) {
    alert(`This appointment is your (${sessionStorage.getItem("scheduleKey")}). Call us to reschedule one, if you'd like to`)
}


// *** Entry Point
//refreshAllSchedules()    //  requests all sschedules and shows one


