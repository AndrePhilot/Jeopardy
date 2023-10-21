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

/* Get NUM_CATEGORIES random category from API.
 * Returns array of category ids
 * 
 * Async function that returns an array
 * of 6 category ids with at least 5 clues
 * and no duplicates */

async function getCategoryIds() {
    const catIds = [];

    while (catIds.length < 6) {
        // Highest id category is 28163 and lowest is 1
        const response = await axios.get(`https://jservice.io/api/category?id=${Math.ceil(Math.random() * 28163)}`);
        if (response.data.clues_count >= 5 && catIds.indexOf(response.data.id) === -1) {
            catIds.push(response.data.id);
        }
    }
    return catIds;
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
    const response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    const clues = response.data.clues.slice(0, 5).map(clue => ({
        question: clue.question,
        answer: clue.answer,
        showing: null
    }));

    return {
        title: response.data.title,
        clues: clues
    };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
    // Create a table element with class table
    const table = $('<table>').addClass('table table-bordered bg-primary text-light text-center table-thicker-borders');

    // Create thead element and append it to the table
    const thead = $('<thead>');
    table.append(thead);

    // Create a tr element for header row and append it to the thead
    const headerRow = $('<tr>');
    thead.append(headerRow);

    // Loop through catObj to create th elements and append them to headerRow
    categories.forEach(category => {
        const th = $('<th>').attr('scope', 'col').text(category.title.toUpperCase());
        th.addClass('text-wrap align-middle');
        headerRow.append(th);
    });

    // Create tbody element and append it to the table
    const tbody = $('<tbody>');
    table.append(tbody);

    // Loop through catObj to create tr and td elements and append them to tbody
    for (let j = 0; j < categories[0].clues.length; j++) {
        const tr = $('<tr>');
        tbody.append(tr);
        for (let i = 0; i < categories.length; i++) {
            const td = $('<td>').addClass('cell-content text-wrap');
            td.attr('id', `${i}${j}`);
            const questionMark = $('<i class="fa-solid fa-circle-question"></i>');
            td.append(questionMark);
            tr.append(td);
        }
    }

    // Append the table to the body or any other desired element
    $('.table-container').append(table);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let catIdx = evt.target.id[0];
    let clueIdx = evt.target.id[1];
    let clickedCell = $(`#${catIdx}${clueIdx}`);

    //Only runs the code if the categories array is populated
    if (categories[catIdx]) {
        if (!categories[catIdx].clues[clueIdx].showing) {
            clickedCell.addClass('expanded');
            $(`#${catIdx}${clueIdx}`).html(categories[catIdx].clues[clueIdx].question);
            categories[catIdx].clues[clueIdx].showing = 'question';

            // After 2 seconds, remove the revealing-answer class and shrink the cell
            // setTimeout(() => {
            //     clickedCell.removeClass('revealing-answer');
            //     clickedCell.removeClass('expanded');
            // }, 9000);
        }
        
        else if (categories[catIdx].clues[clueIdx].showing === 'question') {
            const answer = $(`#${catIdx}${clueIdx}`).html(categories[catIdx].clues[clueIdx].answer);
            answer;
            categories[catIdx].clues[clueIdx].showing = 'answer';
            evt.target.className = 'cell-content answer revealing-answer';
            // These properties will come handy when trying to implement an animation that starts
            // at the original position of the cell:
            // console.log(evt.clientX, evt.clientY);

            // After 2 seconds, remove the revealing-answer class and shrink the cell
            setTimeout(() => {
                clickedCell.removeClass('revealing-answer');
                clickedCell.removeClass('expanded');
            }, 1500);
        }
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    categories = [];
    $('table').remove();
    const spinner = $('<i class="fa-solid fa-spinner fa-spin-pulse p-2" style="color: #ffbb00;"></i>');
    $('.spinner').append(spinner);
    $('button').text('Loading...');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('.fa-spinner').remove();
    $('button').text('Restart!');
}

//Start the game

async function setupAndStart() {
    try {
        showLoadingView();
        //get random category Ids
        const catIds = await getCategoryIds();

        //get data for each category
        for (let catId of catIds) {
            categories.push(await getCategory(catId));
        }
        fillTable();
        hideLoadingView();
    } catch (error) {
        alert(error);
        hideLoadingView();
    }
    $('button').one('click', onClick);
}

/** On click of start / restart button, set up game. */
function onClick() {
    setupAndStart();
    //Remove the event listener
    $('button').off('click', onClick);
}

$('button').one('click', onClick);

/** On page load, add event handler for clicking clues */

$(document).ready(() => {
    $('body').on('click', handleClick);
});