// GET & POST from my Server

const servURL = "https://script.google.com/macros/s/AKfycbxOQBdHAy1jv6k3pwI0LrKLX0kXODJ_l5VL6zkJntzvZJ6uGcmsQ8FascbrODJEMOuwDw/exec"



function server_doGet_(params) {

    fetch(servURL+params)
    .then(res => res.json())
    .then(res => {
        console.log(res)
        return res
    })

}


function server_doPOST_(jsonOBJ) {

    fetch(servURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify(jsonOBJ)
    })

}