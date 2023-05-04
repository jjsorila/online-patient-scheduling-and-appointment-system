$(document).ready(function (e) {
    $("#calendar").fullCalendar({
        editable: false,
        header: {
            left: 'title',
            center: '',
            rigth: 'prev,next today'
        },
        events: '/client/appointments/calendar',
        displayEventTime: false,
        eventRender: (event, el) => {
            el.css({
                "border": "3px solid black"
            })
            if(event.status == "Cancelled"){
                el.css({
                    "background-color": "#FFA500",
                    "color": "black",
                    "cursor": "pointer"
                })
            }
            if(event.status == "Approved") el.css({
                "background-color": "green"
            })
            if(event.status == "Pending") el.css({
                "background-color": "yellow",
                "color": "black"
            })
            if(event.status == "Done") el.css({
                "background-color": "#00FFEF",
                "color": "black"
            })

            el.tooltip({
                title: event.status,
                placement: "left",
                trigger: "hover",
                container: "body"
            });
        },
        eventClick: (event, jsEvent, view) => {
            if(event.status == "Cancelled"){
                $(".reason-shadow").fadeToggle("fast")
                $(".reason").html(`
                    <h3 class="text-center my-3 text-danger">${event.header}</h3>
                    <h5 class="text-center my-3">REASON</h5>
                    <h6 class="text-center my-3">${event.reason}</h6>
                `)
            }
        }
    })

    $(".reason-shadow").click(function() {
        $(".reason-shadow").fadeToggle("fast")
    })

    $(".reason").click(function(e) {
        e.stopPropagation()
    })
})