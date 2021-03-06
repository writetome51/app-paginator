import {BigDatasetPaginator} from './index.js';
import {getCountup} from '@writetome51/get-countup-countdown';
import {arraysMatch} from '@writetome51/arrays-match';


async function runTests() {


	// create a dataSource object:
	let dataSource = {
		dataTotal: 29,
		getLoad: async function(loadNumber, itemsPerLoad, isLastLoad) {
			let start = (loadNumber - 1) * itemsPerLoad + 1;
			let end = start + itemsPerLoad - 1;
			if (isLastLoad) end = this.dataTotal;
			return getCountup(start, end);
		}
	};
	let paginator = new BigDatasetPaginator(dataSource);

	// Test validation.
	let errorsTriggered = 0;
	try {
		paginator.setItemsPerPage(0);
	} catch (e) {
		++errorsTriggered;
	}
	try {
		paginator.setItemsPerPage(-1);
	} catch (e) {
		++errorsTriggered;
	}
	try {
		// @ts-ignore
		paginator.setItemsPerPage('1');
	} catch (e) {
		++errorsTriggered;
	}
	if (errorsTriggered === 3)
		console.log('test 1 passed');
	else
		console.log('test 1 FAILED');


	errorsTriggered = 0;
	try {
		paginator.setItemsPerLoad(0);
	} catch (e) {
		++errorsTriggered;
	}
	try {
		paginator.setItemsPerLoad(-1);
	} catch (e) {
		++errorsTriggered;
	}
	try {
		// @ts-ignore
		paginator.setItemsPerLoad('1');
	} catch (e) {
		++errorsTriggered;
	}
	if (errorsTriggered === 3) console.log('test 2 passed');
	else console.log('test 2 FAILED');


	errorsTriggered = 0;
	try {
		await paginator.setCurrentPageNumber(0);
	} catch (e) {
		++errorsTriggered;
	}
	try {
		await paginator.setCurrentPageNumber(-1);
	} catch (e) {
		++errorsTriggered;
	}
	try {
		// @ts-ignore
		await paginator.setCurrentPageNumber('1');
	} catch (e) {
		++errorsTriggered;
	}
	if (errorsTriggered === 3) console.log('test 3 passed');
	else console.log('test 3 FAILED');


	// Make sure itemsPerLoad can't be less than itemsPerPage:
	let errorTriggered = false;
	paginator.setItemsPerPage(2);
	try {
		paginator.setItemsPerLoad(1);
	} catch (e) {
		errorTriggered = true;
	}
	if (errorTriggered) console.log('test 4 passed');
	else console.log('test 4 FAILED');


	// Make sure itemsPerLoad is kept evenly divisible by itemsPerPage:
	paginator.setItemsPerPage(2);
	paginator.setItemsPerLoad(3);
	let result1 = paginator.getItemsPerLoad(); // should be 2
	paginator.setItemsPerLoad(23);
	let result2 = paginator.getItemsPerLoad(); // should be 22
	if (result1 === 2 && result2 === 22) console.log('test 5 passed');
	else console.log('test 5 FAILED');


	// Make sure totalPages is correct:
	let expectedResults = [15, 10, 8, 6, 5, 5, 4, 4, 3, 3, 3, 3, 3, 2];
	let actualResults = [];
	let itemsPerPageVariations = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
	itemsPerPageVariations.forEach((itemsPerPage) => {
		paginator.setItemsPerPage(itemsPerPage);
		actualResults.push(paginator.getTotalPages());
	});
	if (arraysMatch(expectedResults, actualResults)) console.log('test 6 passed');
	else console.log('test 6 FAILED');


	// Make sure there are no problems if itemsPerLoad is bigger than dataTotal:
	paginator.setItemsPerPage(10);
	paginator.setItemsPerLoad(30);
	await paginator.setCurrentPageNumber(1);
	if (arraysMatch(paginator.getCurrentPage(), getCountup(1, 10)) &&
		paginator.getTotalPages() === 3) console.log('test 7 passed');
	else console.log('test 7 FAILED');


	// Make sure there are no problems if itemsPerPage is bigger than dataTotal:
	dataSource.dataTotal = 21;
	paginator.setItemsPerPage(22);
	await paginator.setCurrentPageNumber(1, {reload:true});
	if (arraysMatch(paginator.getCurrentPage(), getCountup(1, 21))) console.log('test 8 passed');
	else console.log('test 8 FAILED');


	dataSource.dataTotal = 77;
	paginator.setItemsPerPage(25);
	paginator.setItemsPerLoad(25);
	await paginator.setCurrentPageNumber(1, {reload:true});
	let page1 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(paginator.getCurrentPageNumber() + 1);
	let page2 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(paginator.getCurrentPageNumber() + 1);
	let page3 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(paginator.getCurrentPageNumber() + 1);
	let page4 = paginator.getCurrentPage();
	if (arraysMatch(page1, getCountup(1, 25)) &&
		arraysMatch(page2, getCountup(26, 50)) &&
		arraysMatch(page3, getCountup(51, 75)) &&
		arraysMatch(page4, getCountup(76, 77)))
		console.log('test 9 passed');
	else console.log('test 9 FAILED');


	dataSource.dataTotal = 103;
	paginator.setItemsPerLoad(200);
	paginator.setItemsPerPage(11);
	await paginator.setCurrentPageNumber(1, {reload:true});
	page1 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(paginator.getCurrentPageNumber() + 1);
	page2 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(paginator.getCurrentPageNumber() + 1);
	page3 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(paginator.getCurrentPageNumber() + 1);
	page4 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(10);
	let page10 = paginator.getCurrentPage();
	if (arraysMatch(page1, getCountup(1, 11)) &&
		arraysMatch(page2, getCountup(12, 22)) &&
		arraysMatch(page3, getCountup(23, 33)) &&
		arraysMatch(page4, getCountup(34, 44)) &&
		arraysMatch(page10, getCountup(100, 103)))
		console.log('test 10 passed');
	else console.log('test 10 FAILED');


	errorTriggered = false;
	try {
		await paginator.setCurrentPageNumber(11);
	} catch (e) {
		errorTriggered = true;
	}
	if (errorTriggered) console.log('test 11 passed');
	else console.log('test 11 FAILED');



	dataSource.dataTotal = 73;
	paginator.setItemsPerLoad(22);
	paginator.setItemsPerPage(11);
	await paginator.setCurrentPageNumber(7, {reload:true});
	let page7 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(paginator.getCurrentPageNumber() - 1);
	let page6 = paginator.getCurrentPage();
	await paginator.setCurrentPageNumber(1);
	page1 = paginator.getCurrentPage();

	if (
		arraysMatch(page7, getCountup(67, 73)) &&
		arraysMatch(page6, getCountup(56, 66)) &&
		arraysMatch(page1, getCountup(1, 11))) console.log('test 12 passed');
	else console.log('test 12 FAILED');

}

runTests();
