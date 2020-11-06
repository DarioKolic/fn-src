const tester = document.getElementById("stringInput");
const testerWrapper = document.getElementById("suggestions");

const holder = document.createElement("div");
document.body.appendChild(holder);
const s = document.createElement("div");
s.classList.add("select");
s.setAttribute("id", "suggestionList");
testerWrapper.appendChild(s);
tester.setAttribute("list", "suggestionList");

const BASE_URL = "./dummy.json";
//EDIT dummy.json with your url

const req = new Request(`${BASE_URL}`);

function validateBackend(input) {
  const regex = /^[a-zA-Z0-9 ]*$/;

  return regex.test(input);
}

const debounceInput = (fn, delay) => {
  let timeout;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

function root(input, fn) {
  input.addEventListener("click", () => {
    s.classList.remove("hide");
  });
  s.addEventListener("click", e => {
    if (e.target.nodeName === "P") {
      suggestion(e.target.textContent);
      s.classList.add("hide");
    }
  });
  input.addEventListener(
    "input",
    debounceInput(e => {
      s.innerHTML = "";
      fn(e).then(val => {
        val.forEach(item => {
          const opt = document.createElement("p");
          opt.classList.add("option");

          opt.innerText = `${item.keyword}`;

          s.appendChild(opt);
        });
      });
    }, 500)
  );
}

async function dataRetrieve(e) {
  let result = validateBackend(e.target.value);
  if (result) {
    const result = await fetch(req);
    const data = await result.json();

    console.log(data);
    // Logged data -> delete after finding out desired item child
    // or remove item property if there is none
    if (e.target.value) {
      const r = data.filter(item =>
        // change item.keyword if needed
        item.keyword.includes(e.target.value) ? item.keyword : null
      );
      return r;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function suggestion(string) {
  const req = new Request(`${BASE_URL}?keyword=${string}`);

  async function getSuggestions() {
    const result = await fetch(req);
    const data = result.json();

    return data;
  }

  getSuggestions().then(val => {
    const writeData = document.createElement("p");
    //write suggestion data
    val.forEach(item => {
      if (item.keyword === string) {
        writeData.innerHTML = `${item.latlong}`;
        holder.innerHTML = "";
        holder.appendChild(writeData);
      }
    });
  });
}

function ajaxCheckKeyword(suggestions = [], keyword) {
  const DB_DATA = dataRetrieve(tester);
  let keywordResults;

  if (!DB_DATA) {
    return null;
  } else {
    keywordResults = DB_DATA.map(item => {
      if (item.includes(keyword)) {
        return item;
      }
    });
  }
}

root(tester, dataRetrieve);
