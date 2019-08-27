const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const button = document.querySelector('#mybutton');

const rect = canvas.getBoundingClientRect();
let clickedBoxIndex = -1;
console.log("clickedBoxIndex:" + clickedBoxIndex);
let lastBoxIndex = -1;

let persons = [
    {
        title: "은진",
        content: "디발자가 되고 싶은 30대를 앞두고 있습니다."
    },
    {
        title: "한울",
        content: "휴우.... 디발자 가르치기 참 힘들군요...",
    },
    {
        title: "구절",
        content: "못생긴 구절"
    }
]

const gap = 10;
const boxWidth = 600;
const boxHeight = 50;
let isMoving = false;
let xInClickedArea = 0;
let yInClickedArea = 0;
const config = {
    headers: {'Access-Control-Allow-Origin': '*'}
};

window.addEventListener('load', () => {
    console.log('loaded');
    reload();
});

function reload() {
    return axios.get('http://localhost:8080/persons', config)
        .then(response => {
            console.log(response.data);
            persons = response.data;
            clearCanvas();
            drawPersonList();

        })
        .catch(e => {
            console.error(e);
        });
}
// window.addEventListener('load', drawPersonList);

let x = 0;
let y = 0;

canvas.addEventListener('mousedown', e => {
    lastBoxIndex = -1;
    
    x = e.clientX;
    y = e.clientY;
    // console.log(`{${x}, ${y}}`);
    // console.log(`Screen: {${e.screenX}, ${e.screenY}}`);
    // console.log(`Offet: {${e.offsetX}, ${e.offsetY}}`);

    const currentY = e.offsetY - yInClickedArea;
    const currentX = e.offsetX - xInClickedArea;

    clickedBoxIndex = Math.floor(e.offsetY / (boxHeight + gap));

    if (clickedBoxIndex > (persons.length - 1)) {
        clickedBoxIndex = -1;
        isMoving = false;
        return;
    } 

    isMoving = true;
    xInClickedArea = e.offsetX;
    yInClickedArea = e.offsetY - (clickedBoxIndex * (boxHeight + gap));
})

canvas.addEventListener('mousemove', e => {
    if (clickedBoxIndex !== -1 && isMoving === true) {
        clearCanvas();
        drawPersonList();

        const targetBoxIndex = Math.floor(e.offsetY / (boxHeight + gap));
        const targetPositionY = targetBoxIndex * (boxHeight + gap);
        ctx.fillStyle = "rgb(100, 100, 255)";
        ctx.fillRect(0, targetPositionY, boxWidth, 3);

        const personSelected = persons[clickedBoxIndex]
        const currentY = e.offsetY - yInClickedArea;
        const currentX = e.offsetX - xInClickedArea;

        ctx.strokeStyle = "rgb(255, 0, 0)";
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.strokeRect(currentX, currentY, boxWidth, boxHeight);
        ctx.fillText(personSelected.title, currentX + 20, currentY + 20);
        ctx.fillText(personSelected.content, currentX + 20, currentY + 30);
    }
})

canvas.addEventListener('mouseup', e => {
    if (isMoving === true) {
        const person = persons.splice(clickedBoxIndex, 1)[0];
        const targetBoxIndex = Math.floor(e.offsetY / (boxHeight + gap));
        if (targetBoxIndex < clickedBoxIndex) {
            persons.splice(targetBoxIndex - 1, 0, person);
        } else {
            persons.splice(targetBoxIndex , 0, person);    
        }

        axios.put('http://localhost:8080/persons/change', {
            from:  clickedBoxIndex, 
            to: targetBoxIndex
        }, config)
        .then(res => {
            console.log('response', res.data)
            clearCanvas();
            drawPersonList();
        })
        .catch(e => console.error(e));
       
        isMoving = false;

        clickedBoxIndex = -1;
        lastBoxIndex = Math.floor(e.offsetY / (boxHeight + gap));
        
        document.getElementById("title").value= persons[lastBoxIndex].title;
        document.getElementById("content").value = persons[lastBoxIndex].content;

    }
})

function clearCanvas() {
    ctx.clearRect(0, 0, 600, 600);
}

function drawPersonList () {
    for(i = 0; i < persons.length; i++) {
        drawPersonAt(i, persons[i]);
    }
}

function getPerson () {
    const titleElement = document.getElementById("title");
    const contentElement = document.getElementById("content");

    return {
        title: titleElement.value,
        content: contentElement.value
    }
}

function drawPersonAt (position, persons) {
    const currentY = position * (boxHeight + gap);
    
    if (position === clickedBoxIndex) {
        ctx.strokeStyle = "rgb(255, 165, 0)";
    }
    else if(position === lastBoxIndex){
        ctx.strokeStyle = "rgb(255, 0, 0)";
        ctx.strokeRect(0, lastBoxIndex * (boxHeight + gap), boxWidth, boxHeight);
        ctx.fillText(persons.title, 20, currentY + 20);
        ctx.fillText(persons.content, 20, currentY + 30);
    } 
    else {
        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.strokeRect(0, currentY, boxWidth, boxHeight);
        ctx.fillText(persons.title, 20, currentY + 20);
        ctx.fillText(persons.content, 20, currentY + 30);
    }
}

// 선택된 박스의 인덱스 얻는다.
// 인덱스로 부터 person을 얻는다.  persons[selectedIndex]
// 인푹 박스 엘리먼트를 얻는다.
// 이름 인푹 박스에 person.name
// 설명 인풋 박스에 person.descd를 설정한다.

// const persons = ["hanwool", "eunjin"];
// const index = 2;

// const person = persons[2];
// person.name
// person.desc

// const nameEle = document.getElementById("name");
// nameEle.value = person.nema;

// const nameEle = document.getElementById("name");
// nameEle.value

// name;
// desc

// axios.put('edit', {
//     name: name,
//     desdc: desc,
//     index: index
// }

function onClick () {
    const person = getPerson();
    axios.post('http://localhost:8080/persons', person, config)
        .then(res => {
            console.log('response', res.data)
        })
        .catch(e => console.error(e));

    drawPersonAt(persons.length, person);
    persons.push(person);
}

function modify() {
    const person = getPerson();
    
    axios.put('http://localhost:8080/persons/update', {
        index: lastBoxIndex,
        title: person.title,
        content: person.content
    }, config)
        .then(res => reload())
        .catch(e => console.error(e));
}

function remove() {
    const person = getPerson();

    axios.put('http://localhost:8080/persons/remove', {
        index: lastBoxIndex,
    }, config)
        .then(res => reload())
        .catch(e => console.error(e));

        document.getElementById("title").value= " ";
        document.getElementById("content").value = " ";
};
