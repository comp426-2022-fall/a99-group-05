const spin = document.getElementById("spin")
spin.addEventListener("click", spinWheel)

async function spinWheel() {
    const url = "http://localhost:5555/app/spin"
    await fetch(url)
      .then(function(response) {
        return response.json();
      })
// This processes the JSON into DOM calls that replace the existing corresponding elements in index.html 
        .then(function(result) {
          console.log(result);
          document.getElementById("result").innerHTML = result.spin;
        });
};

function homeNav() {
    document.getElementById("homenav").className = "active";
    document.getElementById("home").className = "active";
    document.getElementById("singlenav").className = "";
    document.getElementById("single").className = "inactive";
    document.getElementById("multinav").className = "";
    document.getElementById("multi").className = "inactive";
    document.getElementById("guessnav").className = "";
    document.getElementById("guesscoin").className = "inactive";
  }
  function singleNav() {
    document.getElementById("homenav").className = "";
    document.getElementById("home").className = "inactive";
    document.getElementById("singlenav").className = "active";
    document.getElementById("single").className = "active";
    document.getElementById("multinav").className = "";
    document.getElementById("multi").className = "inactive";
    document.getElementById("guessnav").className = "";
    document.getElementById("guesscoin").className = "inactive";
  }