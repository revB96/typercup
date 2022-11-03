function printHallOfFame(){
    $("#hallOfFame-accordion").html("")
    $("#hallOfFame-modals").html("")
    getEditions().then(editions =>{
        editions.forEach(edition => { 
        getEditionHistory(edition._id).then(editionDetails => {
                var modal = `
                <div class="modal fade" id="modal-${edition._id}" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Lista uczesnikó∑</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Nick</th>
                                    <th scope="col">Punkty</th>
                                    <th scope="col">Z</th>
                                    <th scope="col">PW</th>
                                    <th scope="col">WD</th>
                                    <th scope="col">P</th>
                                    <th scope="col">Q</th>
                                </tr>
                            </thead>
                            <tbody>`
                var accordion =`
                <div class="accordion-item">
                <h2 class="accordion-header" id="panelsStayOpen-headingOne">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                    <div class="col">
                      <div class="row">
                        <h1 class="display-2" style="float: none; margin: 0 auto; text-align: center">${edition.name}</h1>
                        <p class="lead" style="float: none; margin: 0 auto; font-size: 16px; text-align: center">
                          ${edition.participants} uczestników | Pula nagród: ${edition.price_pool}
                        </p>
                      </div>
                    </div>
                  </button>
                </h2>
                <div id="panelsStayOpen-collapseOne" style="text-align: center;" class="accordion-collapse collapse show"
                    aria-labelledby="panelsStayOpen-headingOne">
                    <div class="accordion-body">
                        <div class="row">
                          <div class="col-md-12 text-center">
                          `
                editionDetails.forEach(editionDetail=>{
                    if(editionDetail.result == 1)
                    accordion+=`
                        <div class="row">
                            <div class="col-md-12">
                                <div class="card text-dark bg-warning mb-3" style="max-width: 18rem; float: none; margin: 0 auto;">
                                    <div class="card-header"><img src="img/crown.svg" style="width: 24px; height: 24px" />
                                        <p><b>Zumiko</b></p><small class="text-muted">${editionDetail.user.username}</small>
                                    </div>
                                    <div class="card-body">
                                        <h5 class="card-title">${editionDetail.points} pkt</h5>
                                        <p class="card-text">${editionDetail.pw} PW | ${editionDetail.wd} WD | ${editionDetail.q} Q</p>
                                    </div>
                                </div>
                            </div>
                        </div>`
                    if(editionDetail.result == 2)
                    accordion+=`
                        <div class="row">
                            <div class="col-md-5">
                                <div class="card text-dark mb-3" style="max-width: 18rem; float: none; margin: 0 auto; background-color:#C0C0C0">
                                    <div class="card-header">
                                        <p style="padding: 0; margin:0;">2</p>
                                        <p style="padding: 0; margin:0;">
                                            <b>${editionDetail.user.username}</b>
                                        </p>
                                        <small class="text-muted p-0 m-0" style="padding: 0; margin:0;">${editionDetail.user.friendlyName}</small>
                                    </div>
                                    <div class="card-body">
                                        <h5 class="card-title">${editionDetail.points} pkt</h5>
                                        <p class="card-text">${editionDetail.pw} PW | ${editionDetail.wd} WD | ${editionDetail.q} Q</p>
                                    </div>
                                </div>
                            </div>
                        <div class="col-md-2">
                        </div>`
                    if(editionDetail.result == 3)
                    accordion+=`
                            <div class="col-md-5">
                                    <div class="card text-dark mb-3" style="max-width: 18rem; float: none; margin: 0 auto; background-color:#CD7F32">
                                        <div class="card-header">
                                            <p style="padding: 0; margin:0;">3</p>
                                            <p style="padding: 0; margin:0;">
                                                <b>${editionDetail.user.username}</b>
                                            </p>
                                            <small class="text-muted p-0 m-0" style="padding: 0; margin:0;">${editionDetail.user.friendlyName}</small>
                                        </div>
                                        <div class="card-body">
                                            <h5 class="card-title">${editionDetail.points} pkt</h5>
                                            <p class="card-text">${editionDetail.pw} PW | ${editionDetail.wd} WD | ${editionDetail.q} Q</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        </div>  
                        </div>
                    <div class="row">
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${edition._id}">
                            Pełna lista uczesników
                        </button>
                    </div>
                    
                    </div>
                    </div>`
                
                modal +=`
                <tr>
                    <th scope="row">${editionDetail.result}</th>
                    <td>${editionDetail.user.username}</td>
                    <td>${editionDetail.points}</td>
                    <td>${editionDetail.tickets}</td>
                    <td>${editionDetail.pw}</td>
                    <td>${editionDetail.wd}</td>
                    <td>${editionDetail.d}</td>
                    <td>${editionDetail.q}</td>
                </tr>
                `
                })
            modal += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`
            $("#hallOfFame-modals").append(modal)
            $("#hallOfFame-accordion").append(accordion)
        })
    })
    })
}

$(document).ready(function () {
    if (document.title == "Typer Cup | ⭐ HALL OF FAME ⭐") {
        printHallOfFame();
    }

})