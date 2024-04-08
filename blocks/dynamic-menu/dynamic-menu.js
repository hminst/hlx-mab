export default function decorate(block) {
  const apiConfigBlock = block.querySelectorAll('div > a')[0];
  apiConfigBlock.style.display = 'none';
  const apiUrl = apiConfigBlock.href;
  const div = document.createElement('div');
  block.append(div);
}

export async function loadData(apiUrl) {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}
