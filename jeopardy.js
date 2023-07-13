const BASE_URL = "http://jservice.io/api"
// number of categories
const NUM_CAT = 6;
// number of questions per each category
const NUM_Q = 5;


let scoreTeamA = 0;
let scoreTeamB = 0;
let lastClickedNumTeamA = 0; 
let lastClickedNumTeamB = 0; 
let categories = [];



// Gets a list of category IDs from the Jeopardy API and returns a random sample of NUM_CAT IDs.
async function getCategoryIds() {
    let response = await axios.get(`${BASE_URL}/categories?count=100`)
    let catId = [];

    for (let el of response.data) {
        catId.push(el.id)
    }
        return (_.sampleSize(catId, NUM_CAT))
}



// Gets a category from the Jeopardy API, returns a randomly selected set of clues from the category.
async function getCategory(catId) {
    
    let result = await axios.get(`${BASE_URL}/category?id=${catId}`)
    let category = result.data
    let catTitle = category.title
    const catTitleUP = catTitle.toUpperCase()
    let catClues = category.clues
    let randomClues = _.sampleSize((catClues), NUM_CAT)
    let clues = randomClues.map( el => ({question: el.question, answer: el.answer, airdate: el.airdate, showing: null}));
        return { title: catTitleUP, clues}
}



// Fills the Jeopardy table with the category titles and randomly generated numbers, and adds a click event listener to each cell.
async function fillTable() {
    $("#jeopardy thead").empty();
    let $tr = $('<tr>');
    for (let i = 0; i < NUM_CAT; i++) {
        $tr.append($('<th>').text(categories[i].title))
    }
    $('#jeopardy thead').append($tr)
    
    let randomNumbers = [100, 200, 400, 600, 800, 1000];
    $("#jeopardy tbody").empty(); 
    for (let j = 0; j < NUM_Q; j++ ) {
        
        let $tr = $('<tr>');
            for (let i = 0; i < NUM_CAT; i++) {
                randomNumbers.sort(() => Math.random() - 0.5);
                let randomNum = randomNumbers[i];
                $tr.append($('<td>').attr("id", `${i}-${j}`).text(randomNum));
            }
            $('#jeopardy thead').append($tr)
    }
}



// Handles a click on a Jeopardy table cell and displays the question or answer for the clue, depending on whether the clue has been revealed yet.
function handleClick(evt) {
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];
    let randomNum = parseInt($(evt.target).text());
    
    lastClickedNumTeamA = randomNum ;
    lastClickedNumTeamB = randomNum;
    
    if (clue === undefined) {
        $(`#${catId}-${clueId}`).html(
            "No information"
        );
        $(`#${catId}-${clueId}`).css("background-color", "#ecf230"); 
    }

    else {                    
        let airdate = null;
        if (clue && clue.airdate !== undefined && clue.airdate !== null) {
            airdate = clue.airdate.slice(0, 10);
        }
    

        if (clue && clue.showing === null) {
        $(`#${catId}-${clueId}`).html(
            clue.question + " - (Question's airdate : " + airdate + ")"
        );
        $(`#${catId}-${clueId}`).css("background-color", "#74119c");
        clue.showing = "question";
        } else if (clue && clue.showing === "question") {
        $(`#${catId}-${clueId}`).html(clue.answer);
        $(`#${catId}-${clueId}`).css("background-color", "#28a200");
        clue.showing = "answer";
        }   
    }

}


// Updates the scores for the two teams when the corresponding button is clicked.
const scoreTeamAElement = $("#scoreTeamA");
const addScoreTeamAButton = $("#addScoreTeamA");
const subtractScoreTeamAButton = $("#subtractScoreTeamA");
const scoreTeamBElement = $("#scoreTeamB");
const addScoreTeamBButton = $("#addScoreTeamB");
const subtractScoreTeamBButton = $("#subtractScoreTeamB");
addScoreTeamAButton.on("click", function() {
scoreTeamA += lastClickedNumTeamA;
scoreTeamAElement.text(scoreTeamA);
});
subtractScoreTeamAButton.on("click", function() {
scoreTeamA -= lastClickedNumTeamA;
scoreTeamAElement.text(scoreTeamA);
});
addScoreTeamBButton.on("click", function() {
scoreTeamB += lastClickedNumTeamB;
scoreTeamBElement.text(scoreTeamB);
});
subtractScoreTeamBButton.on("click", function() {
scoreTeamB -= lastClickedNumTeamB;
scoreTeamBElement.text(scoreTeamB);
});



// Sets up the game by getting the category IDs, creating the categories array, and filling the Jeopardy table.
async function setupAndStart() {
    console.debug("setupAndStart");

    let res = await getCategoryIds();
    categories = [];

    for (let catId of res) {
        categories.push(await getCategory(catId))
    }

    fillTable();
}


$('#btn').on("click", setupAndStart)


$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick)
    } 
);