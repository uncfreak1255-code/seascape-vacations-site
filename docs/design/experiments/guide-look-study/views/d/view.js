// View d, Map with toggle: view a's map and beach panels, with what is left of each beach's
// paragraphs behind the toggle from view c. View a's script builds the page, then calls this
// before it sets the ready flag. The toggle label is the only text this view adds to view a's.
//
// A beach this cannot finish is an error, not a skip: view a reports what is thrown here as a
// script error, so verify.cjs fails a half-built page and does not pass it.
window.studyAfterMap = function () {
  for (var i = 1; i <= 5; i++) {
    var section = document.getElementById('pg-' + i);
    var panel = section && section.querySelector(':scope > .a-panel');
    if (!panel) throw new Error('view d: beach ' + i + ' has no map panel');
    var prose = section.querySelectorAll(':scope > p:not(.pg-num)');
    if (!prose.length) throw new Error('view d: beach ' + i + ' has no paragraphs for its toggle');
    var details = window.studyToggle('More about this beach', 'sf-more');
    panel.after(details);
    for (var p = 0; p < prose.length; p++) details.append(prose[p]);
    // The stylesheet ends the section at the toggle row, so nothing may be left under it.
    if (section.lastElementChild !== details) throw new Error('view d: beach ' + i + ' has content the toggle does not hold');
  }
};
