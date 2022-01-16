// getting all the section-question
const sectionQuestion = document.querySelectorAll(".section-question")

for (let i=0; i<sectionQuestion.length; i++) {
    sectionQuestion[i].addEventListener('click', (e) => {
        let arrow = e.target.querySelector(".question-arrow")
        let answer = e.target.nextElementSibling

        if (arrow.classList.contains('-opened-arrow')) {
            arrow.classList.remove('-opened-arrow')
            e.target.classList.remove('-opened-question')
            answer.style.display = 'none'
        } else {
            arrow.classList.add('-opened-arrow')
            e.target.classList.add('-opened-question')
            answer.style.display = 'block'
        }
    })      // addEventListener 'click'
}