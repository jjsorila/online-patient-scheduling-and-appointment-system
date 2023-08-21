$(document).ready(function (e) {
    const birthdate = $("#birthdate"),
        fname = $("#fname"),
        lname = $("#lname"),
        mi = $("#mi"),
        contact = $("#contact"),
        gender = $("#gender"),
        address = $("#address"),
        id = $("meta[name=id]").attr("content"),
        age = $("#age"),
        email = $("#email");

    const gName = $("#g-name")
    const gContact = $("#g-contact")
    const gAddress = $("#g-address")
    const gRelationship = $("#g-relationship")
    let invalidBirthdate = false;

    //CUSTOM DROPDOWN
    gender.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
        placeholder: 'Select'
    })
    $("span.select2").addClass("w-100 border border-4 border-dark rounded text-center")

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    //AUTO CALCULATE AGE
    function calculateAge(birthdate) {
        const birthYear = birthdate.getFullYear();
        const birthMonth = birthdate.getMonth();
        const currentDate = new Date();

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        if (birthdate > currentDate) {
            showToast("❌ Invalid Birthdate")
            return null;
        }

        let ageYears = currentYear - birthYear;
        let ageMonths = currentMonth - birthMonth;

        if (ageMonths < 0) {
            ageYears--;
            ageMonths += 12;
        }

        return { years: ageYears, months: ageMonths };
    }

    //UPLOAD NEW PICTURE
    $("#myFile").on("change", function (e) {
        const file = document.getElementById("myFile").files[0]

        $(".loading").css("display", "block")
        if (file.size > 1000000) {
            showToast("❌ File size should be below 1MB")
            $(this).val("")
            return $(".loading").css("display", "none")
        }

        let data = new FormData();
        data.append("image", file)

        $.ajax({
            url: `/client/update/user/${id}`,
            type: 'PUT',
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            data: data,
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ Profile picture updated")
                toBase64(file).then((res) => {
                    $("#img").attr("src", res)
                })
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Server error")
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })

    //INITIALIZE MEDICAL RECORDS DATATABLE
    $("table").DataTable({
        ajax: '/client/med-records',
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        ordering: false,
        columns: [
            {
                data: "ailment",
                render: ({ diagnosis }) => (`${diagnosis}`)
            },
            {
                data: "patient_type"
            },
            {
                data: "date_created"
            },
            {
                data: "mr_id",
                render: (mr_id) => (`
                    <input type="submit" id="view" value="View" data-id=${mr_id} class="btn btn-success" />
                `)
            }
        ]
    })

    //OPEN MEDICAL RECORD
    $("table").on("click", "input[type=submit]", function (e) {
        const mr_id = $(this).attr("data-id")
        location.href = `/client/view/med-record/${mr_id}`
    })

    //CALCULATE AGE
    birthdate.on("change", function (e) {
        const newAge = calculateAge(new Date($(this).val()))
        if(!newAge){
            invalidBirthdate = true
            return null
        }
        age.val(`${newAge.years} Year/s ${newAge.months} Month/s`)
        invalidBirthdate = false
    })

    //DETECT INPUT UNSAVED CHANGES
    $("form input:not([type=file]), form textarea, form select").on("change keyup paste", function (e) {
        $("#save").attr("disabled", false)
        $("h5.text-center").css("display", "block")
    })

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //DISABLE DEFAULT SUBMIT ACTION FOR USER INFORMATION
    $("form").submit(function (e) {
        e.preventDefault()
    })

    //SAVE/UPDATE INFORMATION
    $("#save").click(function (e) {
        if (!fname.val() || !lname.val() || !contact.val() || !address.val() || !gender.val() || !birthdate.val() || !age.val()) return showToast("❌ Complete all user information")
        if (invalidBirthdate) return showToast("❌ Invalid Birthdate")
        $(".confirmation-shadow").toggleClass("d-none")
    })
    $("#yes").click(function (e) {
        $(".loading").css("display", "block")

        $.ajax({
            url: `/client/update/user/${id}`,
            type: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                fullname: {
                    fname: fname.val(),
                    mi: mi.val() || "",
                    lname: lname.val()
                },
                contact: contact.val(),
                address: address.val(),
                gender: gender.val(),
                birthdate: birthdate.val(),
                age: age.val(),
                guardian: {
                    name: gName.val(),
                    address: gAddress.val(),
                    contact: gContact.val(),
                    relationship: gRelationship.val()
                }
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                $(".confirmation-shadow").toggleClass("d-none")
                showToast("✅ User updated!")
            },
            error: (err) => {
                console.log(err)
            },
            complete: () => {
                $("h5.text-center").css("display", "none")
                $(".loading").css("display", "none")
            }
        })
    })
    $("#no").click(function (e) {
        $(".confirmation-shadow").toggleClass("d-none")
    })
})