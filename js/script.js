const img = ["asset/poto1.jpg", "asset/poto2.jpg", "asset/poto3.jpg"];
let index = 0;
const books = [];
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "BOOKS_APPS";

function changeFotoProfile() {
  if (index == img.length) {
    index = 0;
  }
  let profilenow = document.querySelector("#poto");
  profilenow.setAttribute("src", img[index]);
  index++;
}

setInterval(() => {
  changeFotoProfile();
}, 3000);

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
};

const loadDataFromStorage = () => {
  const getData = localStorage.getItem(STORAGE_KEY);
  let booksData = JSON.parse(getData);

  if (booksData !== null) {
    for (const item of booksData) {
      books.push(item);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);

  const bookSelfNotfinished = document.getElementById("belumDibaca");
  bookSelfNotfinished.innerHTML = "";

  const bookSelfFinished = document.getElementById("sudahDibaca");
  bookSelfFinished.innerHTML = "";

  for (const booksItem of books) {
    const bookElement = createBooksElement(booksItem);
    if (!booksItem.isComplete) {
      bookSelfNotfinished.append(bookElement);
    } else {
      bookSelfFinished.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const submitForm = document.getElementById("form-tambah-Buku");
  submitForm.addEventListener("submit", function (e) {
    tambahBuku();
    e.preventDefault();
  });

  const searchForm = document.getElementById("form-container-search");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBooks();
  });

  const btnReset = document.querySelector(".btn-reset");
  btnReset.addEventListener("click", () => {
    document.getElementById("searchBook").value = "";
    searchBooks();
  });
});

const searchBooks = () => {
  const searchInput = document.getElementById("searchBook").value.toLowerCase();
  const bookItems = document.getElementsByClassName("item");

  for (let i = 0; i < bookItems.length; i++) {
    const itemTitle = bookItems[i].querySelector(".item-title");
    if (itemTitle.textContent.toLowerCase().includes(searchInput)) {
      bookItems[i].classList.remove("hidden");
    } else {
      bookItems[i].classList.add("hidden");
    }
  }
};

const tambahBuku = () => {
  const title = document.getElementById("judul");
  const author = document.getElementById("penulis");
  const year = document.getElementById("tahun");
  const statusBaca = document.getElementById("isReading");
  let status;

  if (statusBaca.checked) {
    status = true;
  } else {
    status = false;
  }

  books.push({
    id: +new Date(),
    booksTitle: title.value,
    booksAuthor: author.value,
    booksYear: Number(year.value),
    isComplete: status,
  });

  title.value = null;
  author.value = null;
  year.value = null;
  statusBaca.checked = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
};

const createBooksElement = (objectBooks) => {
  const judulElement = document.createElement("p");
  judulElement.classList.add("item-title");
  judulElement.innerHTML = `${objectBooks.booksTitle} <span>(${objectBooks.booksYear}) </span>`;

  const authorElement = document.createElement("p");
  authorElement.classList.add("item-author");
  authorElement.innerHTML = objectBooks.booksAuthor;

  const descContainer = document.createElement("div");
  descContainer.classList.add("item-desc");
  descContainer.append(judulElement, authorElement);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("item-action");

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(descContainer);
  container.setAttribute("id", `book-${objectBooks.id}`);

  if (objectBooks.isComplete) {
    const btnBack = document.createElement("button");
    btnBack.classList.add("btn-back");
    btnBack.innerHTML = `<i class='bx bx-undo'></i>`;

    btnBack.addEventListener("click", () => {
      undoSelfBookstoUnfinished(objectBooks.id);
    });

    const btnDelete = document.createElement("button");
    btnDelete.classList.add("btn-delete");
    btnDelete.innerHTML = `<i class='bx bx-trash'></i>`;

    btnDelete.addEventListener("click", () => {
      deleteBookSelf(objectBooks.id);
    });

    actionContainer.append(btnBack, btnDelete);
    container.append(actionContainer);
  } else {
    const btnDone = document.createElement("button");
    btnDone.classList.add("btn-done");
    btnDone.innerHTML = `<i class='bx bx-check'></i>`;

    btnDone.addEventListener("click", () => {
      addBookselfFinished(objectBooks.id);
    });

    const btnDelete = document.createElement("button");
    btnDelete.classList.add("btn-delete");
    btnDelete.innerHTML = `<i class='bx bx-trash'></i>`;

    btnDelete.addEventListener("click", () => {
      deleteBookSelf(objectBooks.id);
    });

    actionContainer.append(btnDone, btnDelete);
    container.append(actionContainer);
  }

  return container;
};

const addBookselfFinished = (booksID) => {
  const booksTarget = findBooks(booksID);

  if (booksTarget == null) return;
  booksTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
};

const deleteBookSelf = (booksID) => {
  const bookTarget = findBooksIndex(booksID);

  if (booksID === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
};

const undoSelfBookstoUnfinished = (booksID) => {
  const booksTarget = findBooks(booksID);

  if (booksTarget == null) return;

  booksTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
};

const findBooks = (booksID) => {
  for (const booksItem of books) {
    if (booksItem.id == booksID) {
      return booksItem;
    }
  }
  return null;
};

const findBooksIndex = (booksID) => {
  for (const indexBooks in books) {
    if (books[indexBooks].id === booksID) {
      return indexBooks;
    }
  }
  return -1;
};

const saveBooks = () => {
  if (isStorageExist()) {
    const booksDataConvert = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, booksDataConvert);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};
