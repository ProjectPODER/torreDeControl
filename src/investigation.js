import $ from 'jquery';
const $window = $(window);
const $document = $(document);
const $body = $(document.body);

module.exports = () => {
  const investigations = {
    showed: 0,
    showFirst: 3,
    loadBy: 1,
    data: []
  };
  $.get('data/investigation.json').done((data) => {
    investigations.data = data;
    appendInvestigations(0, investigations.showFirst);
    appendWhenPageBottom();
  });

  function appendInvestigations(from, to) {
    const hunk = getInvestigations(from, to)
    investigations.showed += to - from;
    const hunkDOM = createInvestigationArticles(hunk)
    $('.investigation-list').append(hunkDOM);
    setTimeout(() => {
      $('.investigation-item').addClass('enter');
    });
  }

  function getInvestigations(from, to) {
    return investigations.data.slice(from, to).map((item) => {
      return item;
    });
  }

  function createInvestigationArticles(hunk) {
    return hunk.map((item) => {
      const {title, date, author, text, image, link} = item;
      const parsedDate = (new Date(date)).toLocaleDateString().replace('/\g', '-',);
      const DOMString = `
        <li class="investigation-item">
          <article class="investigation-article">
            <figure class="investigation-media">
              <img src="${image}" alt="" class="investigation-image">
            </figure>
            <div class="investigation-data">
              <header class="investigation-header">
                <div class="investigation-references">
                  <h1 class="investigation-title">${title}</h1>
                </div>
                <div class="investigation-metadata">
                  <time class="investigation-date" datetime="${parsedDate}">${parsedDate}</time>
                  <span class="investigation-author">Publicado por ${author}</span>
                </div>
              </header>
              <div class="investigation-body">
                <p class="investigation-excerpt">
                  ${text}
                </p>
              </div>
              <footer class="investigation-footer">
                <a rel="noopener noreferrer" target="_blank" href="${link}" class="investigation-view-more">ver nota</a>
              </footer>
            </div>
          </article>
        </li>
      `
      return $(DOMString);
    });
  }

  function appendWhenPageBottom() {

    $window.scroll(function() {
       if($window.scrollTop() + $window.height() > $document.height() - 200) {
          console.log(investigations.showed,investigations.loadBy)
          appendInvestigations(investigations.showed, investigations.showed + investigations.loadBy);
       }
    });
  }
};