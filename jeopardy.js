const BASE_URL = "http://jservice.io/api"
// number of categories
const NUM_CAT = 6;
// number of questions per each category
const NUM_Q = 5;


// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let response = await axios.get(`${BASE_URL}/categories?count=100`)
    let catId = [];
        // console.log(response.data);
    for (let el of response.data) {
        catId.push(el.id)
    }
        // console.log(catId)
        // console.log(_.sampleSize(catId, NUM_CAT))
        return (_.sampleSize(catId, NUM_CAT))
}


/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    
    let result = await axios.get(`${BASE_URL}/category?id=${catId}`)
        // console.log(result.data)
    let category = result.data
    let catTitle = category.title
        // console.log(catTitle)
    const catTitleUP = catTitle.toUpperCase()
        // console.log(typeof(catTitle))
    let catClues = category.clues
    let randomClues = _.sampleSize((catClues), NUM_CAT)
        // console.log(catClues)
    let clues = randomClues.map( el => ({question: el.question, answer: el.answer, airdate: el.airdate, showing: null}));
       
        // console.log({ title: catTitleUP, clues})
        return { title: catTitleUP, clues}
}


/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    // fill the table header using the selected categories 
    $("#jeopardy thead").empty();
    let $tr = $('<tr>');
    for (let i = 0; i < NUM_CAT; i++) {
        // $tr.append($('<th>').text(categories[i].title))
        $tr.append($('<th>').text(categories[i].title))
    }
            $('#jeopardy thead').append($tr)
    
    // fill rows with questions  
    $("#jeopardy tbody").empty(); 
    for (let j = 0; j < NUM_Q; j++ ) {
        let $tr = $('<tr>');
            for (let i = 0; i < NUM_CAT; i++) {
                $tr.append($('<td>').attr("id", `${i}-${j}`).text("?"));
            }
            $('#jeopardy thead').append($tr)
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id
    let [catId, clueId] = id.split("-")
    let clue = categories[catId].clues[clueId]
    // console.log(clue.showing)
    let airdate = (clue.airdate).slice(0,10)
    if (clue.showing === null ) {
        $(`#${catId}-${clueId}`).html(clue.question + " - (Question's airdate : " + airdate + ")" );
        $(`#${catId}-${clueId}`).css("background-color", "#74119c") 
        clue.showing = "question"
    } else if (clue.showing === "question") {
        $(`#${catId}-${clueId}`).html(clue.answer);
        $(`#${catId}-${clueId}`).css("background-color", "#28a200")
        clue.showing = "answer"
    } else return

}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    console.debug("setupAndStart");
    
    let res = await getCategoryIds();

    categories = [];
    
    for (let catId of res) {
        categories.push(await getCategory(catId))
    }

    fillTable();
    // console.log("categories =", categories)
}

/** On click of restart button, restart game. */

$('#btn').on("click", setupAndStart)

/** On page load, setup and start & add event handler for clicking clues */
$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick)
    } 
);
