// The "More about …" toggle that views c and d share: an empty <details> with its label. The
// view moves the page's own paragraphs into it; the label is the only new text.
window.studyToggle = function (label, className) {
  var details = document.createElement('details');
  details.className = className;
  var summary = document.createElement('summary');
  var text = document.createElement('span');
  text.textContent = label;
  var mark = document.createElement('i');
  mark.setAttribute('aria-hidden', 'true');
  summary.append(text, mark);
  details.append(summary);
  return details;
};
