
// **************** Global Vars **************** 
// path to YouTube player API
const playerAPI = "https://www.youtube.com/iframe_api"

// DOM elements
const controller = document.querySelector('input[type=range]');
const radialProgress = document.querySelector('.RadialProgress');
const controlQuestions = document.querySelector(".controlQuestions")
const quizzeResult = document.querySelector(".quizzeResult")

// passed objects and consts
const videoData = sessionStorage.videoData != undefined ? JSON.parse(sessionStorage.videoData) : {}
sessionStorage.removeItem("videoData")

const teachAreaURL = sessionStorage.teachAreaURL != undefined ? sessionStorage.teachAreaURL : ""
sessionStorage.removeItem("teachAreaURL")

const stObj = sessionStorage.stTeachObj != undefined ? JSON.parse(sessionStorage.stTeachObj) : undefined
sessionStorage.removeItem("stTeachObj")

// questions for test and flag when to show quizze
videoData.questions.map(que => {
    que.answers = que.answers.sort(() => Math.random() - 0.5);   // shuffeling answers
})
const myQuestions = videoData.questions
const whenToShowQuizze = 0.75   // 75%

// Variables & consts for progress
let videoDuration = NaN
let videoCurrentPosition = 0
let videoMaxPosition = 0

const savingStep = 5    //  every 5%
let epsilon = undefined

// Interval var for checking Player status
let timerId
const checkInterval = 10    //  1000 - it's a second

// PLAYER variable and OPTIONS for player
let player
const myOptions = {
    'autoplay': 0,
    'fs': 1,
    'iv_load_policy': 3,
    'showinfo': 0,
    'rel': 0,
    'cc_load_policy': 0,
    'start': 0,
    'end': 0,
    'controls': 0,
    'disablekb': 1,
    'modestbranding': 1
}


//  TMP block with questions

function insertQuestions(aQuestions) {
    let html = ""
    for (let i=0; i<aQuestions.length; i++) {
        html += "<section class='newFlexLine _margin'>"
        html += `<section class='questionBlock' id='${aQuestions[i].id}'>${aQuestions[i].question}</section>`
        
        html += "<section class='answersBlock'>"

        let answ = aQuestions[i].answers
        for (let j=0; j<answ.length; j++) {

            html +=
            `<section class='answer'>
                <input class="answerRadio" type="radio" name="question${i}" id="answer${i}_${j}" value="answer${i}_${j}">
                <label class="answerLabel" for="answer${i}_${j}" name="answer${i}_${j}">${ answ[j] }</label>
            </section>`

        }

        html += "</section>"
        html += "</section>"        // end of newFlexLine
    }
    
    html += `<button class="quizze-btn" type="Submit">Submit Quizze</button>`

    return html
}

function insertQuestionsSkeleton(aQuestions) {
    // shows skeleton, when quizze is not available yet
    let html = `<section class="skeleton-question"></section>`
    
    let answ = aQuestions[0].answers
    for (let j=0; j<answ.length; j++) {
        html +=
        `<section class="newFlexLine">
            <section class="skeleton-radio"></section>
            <section class="skeleton-label"></section>
        </section>`
    }

    html += `<section class="skeleton-button">Submit Quizze</section>`
    return html
}

controlQuestions.addEventListener("submit", (e) => {
    // uses when Submit is clicked for verify tests
    e.preventDefault()
    
    let results = []

    for (let i=0; i<myQuestions.length; i++) {

        results.push({
            id: i,
            question: myQuestions[i].question,
            answer: "no answer",
            status: false
        })
        let answ = document.getElementsByName(`question${i}`)

        for (let j=0; j<answ.length; j++) {
            let label = document.getElementsByName(`answer${i}_${j}`)[0]    //  getting answer radio label (answer itself)
            if (answ[j].checked){
                // checking whether answer is correct
                results[i].answer = label.textContent
                results[i].status = label.textContent === myQuestions[i].correctAnswer
                // styling marker depending on correct or not
                let markerColor = results[i].status ? "var(--true)" : "var(--false)"
                document.getElementById(`answer${i}_${j}`).style.setProperty("--radioColor", markerColor)
                label.style.setProperty("--labelColor", markerColor)
            } else { label.style.setProperty("--labelColor", "#333") }
        }
    }

    let quizzeFinalResult = true
    for (let i=0; i<results.length; i++) {
        let question = document.getElementById(results[i].id)
        question.classList.remove(!results[i].status)

        if (results[i].answer === "no answer") {    //  was not answered to this question
            // stays gray, deliting green/red classes
            question.classList.remove(results[i].status)
        } else {    //  there is an answer
            // use proper class to question - green/red
            question.classList.add(results[i].status)        
        }
        
        quizzeFinalResult = quizzeFinalResult && results[i].status
    }

    if (quizzeFinalResult) {
        saveProgressonServer("saveQuizze")
        quizzeResult.textContent = "Congratulation!!! Your result has been saved"
    } else {
        quizzeResult.textContent = "You've missed somewhere"
    }

})

// TMP block with questions


const setProgress = (progress) => {

    let value = `${ Math.round(progress * 100 / controller.max) }%`

    if (player === undefined) {
        radialProgress.style.setProperty('--progress', value)
        radialProgress.textContent = value
        radialProgress.setAttribute('aria-valuenow', value)
    } else {
        if (player.getPlayerState() != 2) {
            if (value !== radialProgress.textContent) {
                radialProgress.style.setProperty('--progress', value)
                radialProgress.textContent = value
                radialProgress.setAttribute('aria-valuenow', value)
            }
        }        
    }

}



controller.oninput = () => {

    if (player === undefined) { return }

    if (videoDuration !=NaN) {
        player.pauseVideo()

        let scrolledPosition = controller.value * videoDuration / controller.max
        if (scrolledPosition > videoMaxPosition) {
            radialProgress.style.setProperty('--hue', 20)
            scrolledPosition = videoMaxPosition
        } 
    
        player.seekTo(scrolledPosition)

        player.playVideo()
    }
    
}


radialProgress.addEventListener("click", (e) => {

    if (player == undefined) { return }

    if (player.getPlayerState() === 1) {
        player.pauseVideo()
    } else {
        if (player.getPlayerState() != 3 && player.getPlayerState() != 5) {
            player.playVideo()
        }
    }
})



function onYouTubeIframeAPIReady() {
    // This function creates an <iframe> (and YouTube player) after the API code downloads

    player = new YT.Player('player', {
        height: videoData.height,
        width: videoData.width,
        videoId: videoData.videoId,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: myOptions
    })

    // setting video ID and Title
    document.getElementsByClassName("lessonId")[0].textContent = videoData.lesson
    document.getElementsByClassName("lessonTitle")[0].textContent = videoData.lessonTitle

}



async function onPlayerReady(event) {
    // The API will call this function when the video player is ready
    event.target.playVideo();
    videoDuration = await player.getDuration()
    if (videoData.progress != undefined) {
        videoMaxPosition = videoDuration * videoData.progress
    }
    epsilon = 0.7 / videoDuration
}



function checkVideoPosition() {

    videoCurrentPosition = player.getCurrentTime()
    
    if (videoCurrentPosition > videoMaxPosition) {

        if ((videoCurrentPosition - videoMaxPosition) > checkInterval*1.1) {
            radialProgress.style.setProperty('--hue', 20)
            player.seekTo(videoMaxPosition - checkInterval)
        } else {
            videoMaxPosition = videoCurrentPosition
            radialProgress.style.setProperty('--hue', 220)

            if (epsilon != undefined) {
                if ((videoCurrentPosition * 100 / videoDuration) % savingStep < epsilon) {
                    saveProgressonServer("updateCourse")
                }   
            }   //  epsilon != undefined
        }

    }   //  videoCurrentPosition > videoMaxPosition

    if ((videoMaxPosition/videoDuration) > whenToShowQuizze && quizzeResult.style.display == "none") {
        controlQuestions.innerHTML = insertQuestions(myQuestions)
        controlQuestions.style.width = "auto"
        quizzeResult.style.display = "block"
    }
    if (videoCurrentPosition < (videoMaxPosition*0.95)) {
        radialProgress.style.setProperty('--hue', 100)
    } 
    if (videoDuration !=NaN) {
        let covered = Math.round(videoMaxPosition * controller.max / videoDuration)
        let current = Math.round(videoCurrentPosition * controller.max / videoDuration)

        controller.value = current
        setProgress(covered)
    }


}





function onPlayerStateChange(event) {

    if (event.data == YT.PlayerState.ENDED) {
        clearInterval(timerId)
        // player stops at 99%, thus progress stops at 95%
        videoCurrentPosition = (player.getCurrentTime() / player.getDuration()) > 0.95 ? player.getDuration() : player.getCurrentTime()
        controller.value = videoCurrentPosition * controller.max / videoDuration
        
        saveProgressonServer("updateCourse")  //  save where ended
    }

    if (event.data == YT.PlayerState.PAUSED) {
        clearInterval(timerId)
        radialProgress.innerHTML =
        `<svg class="radialInner_icon">
            <use xlink:href="#playButton"></use> 
        </svg>`  
    }

    if (event.data == YT.PlayerState.PLAYING) {
        timerId = setInterval(checkVideoPosition, checkInterval)
    }
    
}


//  fetch response tools

function saveProgressonServer(actionType) {
    
    if (teachAreaURL === undefined) { return }
    if (stObj === undefined) { return }
    if (stObj.status != "ok") { return }

    try {
        fetch(teachAreaURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow',
            body: JSON.stringify({
                action: actionType,
                email: stObj.Email,
                nameKey: stObj.StudentKey,
                name: stObj.Student,
                key: stObj.Key,
                videoId: videoData.videoId,
                videoPosition: videoCurrentPosition,
                videoPers: videoCurrentPosition / videoDuration
            })  //  JSON.stringify
        })  //  fetch
    } catch (e) { console.log(e) }
}





// ************ Entry Point *****************

// This code loads the IFrame Player API code asynchronously.
const tag = document.createElement('script');
tag.src = playerAPI;
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// updating progressBar
setProgress(controller.value)

// adding Quizze skeleton to the page
let skeleton_html = `<h2>Quizze will be available here after reaching ${whenToShowQuizze*100}% of video duration</h2>`
skeleton_html += insertQuestionsSkeleton(myQuestions)
controlQuestions.innerHTML = skeleton_html







