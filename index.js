let items = document.getElementsByClassName("item")
let refs = document.getElementsByClassName("itemRef")
let refs_side = document.getElementsByClassName("itemRef_side")



for(let i=0; i<items.length;i++){

    // Adding OnClick to Header Links
    refs[i].addEventListener("click", (e)=>{
        e.preventDefault()
        items[i].scrollIntoView({
            block: 'start',
            behavior:'smooth'
        })
    })

    // Adding OnClick to Side Menu Links
    refs_side[i].addEventListener("click", (e)=>{
        e.preventDefault()
        items[i].scrollIntoView({
            block: 'start',
            behavior:'smooth'
        })
    })

}


function showHideBlock(block){

    if(block.style.display != 'flex'){
        block.style.display = 'flex'
    } else {block.style.display = 'none'}

}



// Closing ide menu by click on Item
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener("click", (e) => {
        document.querySelector('.side__MenuInner').style.display = "none"
    })
})



// *** Transform when scroll ***
// Create the observer
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        let animClass = entry.target.tagName === 'H1' ? "itemTransformation" : "subItemTransformation"
        if (entry.isIntersecting) {
            entry.target.classList.add(animClass)
        } else {
            entry.target.classList.remove(animClass)
        }
    })
})
  
// Tell the observer which elements to track
document.querySelectorAll('.item__title').forEach(itemTitle => {
    observer.observe(itemTitle);
})
document.querySelectorAll('.item__subtitle').forEach(itemTitle => {
    observer.observe(itemTitle);
})
