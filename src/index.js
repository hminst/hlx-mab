import json2html from 'node-json2html';

export default function transfromToHtml(data) {
  return json2html.tranform(data);
}
