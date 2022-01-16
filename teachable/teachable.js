// this module fetches POST to StudentServer, verifies student's credentials
// and fulfills videoThumb list with percent of progress
// also it leads to playerPage when clicked on certain video

let stTeachObj = null


function checkingTeachAreaResponse() {
    const studentInfo = document.getElementById("studentInfo")
    
    if (!stTeachObj) {
        studentInfo.textContent = "We were not able to find you among our tuition subscribers. Please contact with our office representative"
        return false
    }
    if (stTeachObj.status != "ok") {
        studentInfo.textContent = "Error occurred. Try to LonIn with your student email and come back. If this will happened again, let us know please"
        return false
    }
    if (sessionStorage.getItem("StudentServerLoggedIn") === null
        || sessionStorage.getItem("StudentServerLoggedIn").toLowerCase() != stTeachObj.Email.toLowerCase()) {
        studentInfo.textContent = "We have to verify your identity, please LogIn"
        return false
    }
    if (stTeachObj.AdminsPermit != "Yes") {
        studentInfo.textContent = "Looks like you don’t have admin’s permit to visit our online courses. If you believe, that this is mistake, then let us know please"
        return false
    }
    if (!stTeachObj.isInLastH) {
        studentInfo.textContent = "Your session has been expired, LogIn again and come back please"
        return false
    }
    
    document.getElementById("infoPrompt").textContent = `Hi ${stTeachObj.Student}!`
    
    let infoProgress = document.getElementById("infoProgress")
    infoProgress.classList.remove("skeleton-radio")
    infoProgress.classList.add("infoProgress")
    infoProgress.style.setProperty("--myProgress", "0%")
    infoProgress.textContent = "Check out your progress"
    
    return true
}



//  *** working with allVideoData array ***

function fulFillVideoList() {

    // if (stTeachObj.courses === undefined || stTeachObj.quizzes === undefined) { return }
    // if (stTeachObj.courses.status != "ok") { return }
    // if (stTeachObj.quizzes.status != "ok") { return }

    let avProgress, sumProgress = 0, testsPassed = 0

    Array.from(document.getElementsByClassName("videoSection")).forEach((videoSection, index) => {
        // adding a title
        videoSection.setAttribute("data-title", `${index+1}.${allVideoData.videos[index].lessonTitle}`)
        
        // checking course progress
        let percOfView = stTeachObj.courses[videoSection.id]
        if (typeof(percOfView) != "number") { percOfView = 0 }
        allVideoData.videos[index].progress = percOfView
        document.getElementById(`watch${videoSection.id}`).textContent = `${Math.round(percOfView*100)}%`
        sumProgress += percOfView

        // calculating tests passed
        if (typeof(stTeachObj.quizzes[videoSection.id]) === "number") { testsPassed += 1 }

        // checking quizze progress
        allVideoData.videos[index].quizze = typeof(stTeachObj.quizzes[videoSection.id]) === "number" // true OR false
        if (typeof(stTeachObj.quizzes[videoSection.id]) === "number") {
            document.getElementById(`test${videoSection.id}`).innerHTML = "<svg class='test_done'><use xlink:href='#done'></use></svg>"
        }

        // styling as DONE ALL if watched 100% and tests are passed
        if (percOfView > 0.99 && typeof(stTeachObj.quizzes[videoSection.id]) === "number") {
            videoSection.style = "background-color: hsl(109, 49%, 42%); color: hsl(240, 33%, 99%); fill: hsl(240, 33%, 99%);"
        }
    
        // adding event listeners
        videoSection.addEventListener("click", () => {

            for (let i=0; i<allVideoData.videos.length; i++) {
                if (allVideoData.videos[i].videoId === videoSection.id) {
                    // passing data to static HTML Page
                    sessionStorage.videoData = JSON.stringify(allVideoData.videos[i])
                    sessionStorage.stTeachObj = JSON.stringify(stTeachObj)
                    sessionStorage.teachAreaURL = teachAreaURL
                    document.getElementById("player").click()
                    break
                }
            }

        })



    })  //  forEach 

    let watchPerc = sumProgress / allVideoData.videos.length
    let testsPerc = testsPassed / allVideoData.videos.length

    avProgress = (watchPerc + testsPerc) * 50
    
    let infoProgress = document.getElementById("infoProgress")
    infoProgress.textContent += ` (${Math.round(avProgress * 10) / 10}%)`
    infoProgress.style.setProperty("--myProgress", `${avProgress}%`)

}




// ************ Entry Point *****************

// 1. Trying to fetch to teachArea. Response will be session status (4h after last logIn)

try {
    fetch(URI_teachArea)
    .then(res => res.json())
    .then(res => {
        stTeachObj = res
        if (checkingTeachAreaResponse()) {
            // putting progress on Thumbs, if any
            fulFillVideoList()
        } else { sessionStorage.removeItem("StudentServerLoggedIn") }
    })     // fetch.then URI_check_session
} catch(e) { console.log(e) }


