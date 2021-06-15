
// Кастомный HTTP-модуль

function customHttp() {
    return {
      get(url, cb) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          xhr.addEventListener('load', () => {
            if (Math.floor(xhr.status / 100) !== 2) {
              cb(`Error. Status code: ${xhr.status}`, xhr);
              return;
            }
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          });
  
          xhr.addEventListener('error', () => {
            cb(`Error. Status code: ${xhr.status}`, xhr);
          });
  
          xhr.send();
        } catch (error) {
          cb(error);
        };
      },
      post(url, body, headers, cb) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.addEventListener('load', () => {
            if (Math.floor(xhr.status / 100) !== 2) {
              cb(`Error. Status code: ${xhr.status}`, xhr);
              return;
            }
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          });
  
          xhr.addEventListener('error', () => {
            cb(`Error. Status code: ${xhr.status}`, xhr);
          });
  
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          };
  
          xhr.send(JSON.stringify(body));
        } catch (error) {
          cb(error);
        }
      },
    };
};

const http = customHttp();



//  Сервис, который используем при выполнении запросов
const newsService = (function() {
    const apiKey = '552aa0cea69848ac9051a695a5f74719';
    const apiUrl = 'https://news-api-v2.herokuapp.com';

    return {
        topHeadlines(country = 'us', cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb); //запрос на top-headlines
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb); //запрос на everything
        },
        sources() {
            http.get(`${apiUrl}/sources?apiKey=${apiKey}`, cb); //Запрос на категории
        },
    };

} ());


//Elements UI
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categorySelect = form.elements['category'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});



  
//  Инициализация фреймворка Materialize
document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews(); //вызываем сразу во время загрузки страницы
});



//  Функция базовой загрузки новостей
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelect.value;

  if(!searchText) {
    newsService.topHeadlines(country, onGetResponse); //обращаемся к сервису если ничего не ввели в input
  } else if(searchText) {
    newsService.everything(searchText, onGetResponse);
  } else if (category) {
    newsService.sources(category, onGetResponse)
  }

};


//  Функция получения ответа от сервера
function onGetResponse(err, res) {
  removeLoader();

  if(err) {
    showAlert(err, 'error-msg');
    return;
  };

  if(!res.articles.length) {
    return;
  };

  renderNews(res.articles);
};


//  Функция для рендера новостей
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');

  if(newsContainer.children.length) {  //если есть дочерние элементы, то вызываем ыункцию удаления этих элементов
    clearContainer(newsContainer);
  };

  let fragment = '';
  news.forEach(newsItem => {
      const element = newsTemplate(newsItem);
      fragment += element
  });
  newsContainer.insertAdjacentHTML('afterbegin', fragment); //вставляем HTML-строку
};


// Функция для отчистки контейнера
function clearContainer(container) {
  let child = container.lastElementChild;
  while(child) {  //проверяем, что если у контейнера есть дочерние элементы, их удаляем
    container.removeChild(child);
    child = container.lastElementChild;
  };
};


//  Функция для создания разметки
function newsTemplate({ urlToImage, title, url, description }) {
  let image = {
    urlToSecondImage: 'https://futurenow.com.ua/wp-content/uploads/2021/01/shho-take-url-adresa.jpg'
  };
    return `
    <div class="col s12">
        <div class="card">
            <div class="card-image">
                <img src="${urlToImage || image.urlToSecondImage}">
                <span class="card-title">${title || ''}</span>
            </div>
            <div class="card-content">
                <p>${description || ''}</p>
            </div>
            <div class="card-action">
                <a href="${url}"> Read more </a>
            </div>
        </div>
    </div>
    `
};


// Функция вывода предупреждения (сообщение об ошибке)
function showAlert(msg, type = 'success') {
  M.toast({html: msg, classes: type});
};


// Функция показа прелодера
function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `);
};


// Функция скрытия прелодера
function removeLoader() {
  const loader = document.querySelector('.progress');
  if(loader) {
    loader.remove();
  };
};