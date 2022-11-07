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
            if(event.status == "Cancelled") el.css({
                "background-color": "red"
            })
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
        }
    })
})