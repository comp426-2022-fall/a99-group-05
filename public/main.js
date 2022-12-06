const spin = document.getElementById("spin")
spin.addEventListener("click", spinWheel)

async function spinWheel() {
    const endpoint = "app/spin/"
    const url = document.baseURI+endpoint
    await fetch(url)
        .then(function(response) {
            return response.json();
        })
            .then(function(result) {
                console.log(result);
                document.getElementById("result").innerHTML = result.win;
            });
}