/* Add one or more listeners to an element
** @param {DOMElement} element - DOM element to add listeners to
** @param {string} events - space separated list of event names, e.g. 'click change'
** @param {Function} fn - function to attach for each event as a listener
** @param {boolean} useCapture
*/
export function addListeners(element, events, fn, useCapture = false) {
    events.split(' ').forEach(e => element.addEventListener(e, fn, useCapture));
}