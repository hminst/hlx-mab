export default function decorate(block) {
  const apiConfigBlock = block.querySelectorAll('div > a')[0]
  apiConfigBlock.style.display = 'none'
  const apiUrl = apiConfigBlock.href;
  const div = document.createElement('div');

  loadData(apiUrl).then((data) => {
    for (var key in data) {
      let elem = document.createElement('div');
      elem.textContent = data[key]
      elem.setAttribute('data-propertyName', key)
      block.append(elem)
    }
  })
  
  block.append(div)

  
}

export async function loadData(apiUrl) {
  const response = await fetch(apiUrl)
  const data = await response.json()
  return data;
}
