export default function decorate(block) {
  console.log(block);
  const nutritions = block.querySelectorAll('[data-property="nutrition"]');
  nutritions?.forEach((nutrition) => {
    let headline = document.createElement("div");
    headline.innerHTML = "nutitional data:";
    headline.setAttribute("class", "nutitional_headline");
    nutrition.prepend(headline);
  });
}
