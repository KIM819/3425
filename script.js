document.addEventListener("DOMContentLoaded", () => {
    const seatsContainer = document.getElementById("seatsContainer");
    const studentNumberSelect = document.getElementById("studentNumber");
    const submitSeatButton = document.getElementById("submitSeat");
    const finalizeSeatsButton = document.getElementById("finalizeSeats");
    const toggleViewButton = document.getElementById("toggleView");
    const seatResults = document.getElementById("seatResults");

    const seatMap = [
        [1, 8, 15, 22, 29, "space"],
        [2, 9, 16, 23, 30, 36],
        [3, 10, 17, 24, 31, 37],
        [4, 11, 18, 25, 32, 38],
        [5, 12, 19, 26, 33, 39],
        [6, 13, 20, 27, 34, "space"],
        [7, 14, 21, 28, 35, "space"],
    ];

    const pendingSeats = [];
    const confirmedSeats = [];
    const contestedSeats = [];
    let selectedSeat = null;
    let isSeatNumberView = true;

    // プルダウンに出席番号を動的生成
    function populateStudentNumbers() {
        for (let i = 1; i <= 39; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = `出席番号 ${i}`;
            studentNumberSelect.appendChild(option);
        }
    }

    // 初期化時にプルダウンを作成
    populateStudentNumbers();

    // Render seat layout
    seatMap.forEach((row) => {
        row.forEach((seatNumber) => {
            if (seatNumber === "space") {
                const spaceElement = document.createElement("div");
                spaceElement.className = "space";
                seatsContainer.appendChild(spaceElement);
                return;
            }

            const seatElement = document.createElement("div");
            seatElement.className = "seat";
            seatElement.textContent = seatNumber;
            seatElement.dataset.seatNumber = seatNumber;

            // Add click functionality
            seatElement.addEventListener("click", () => {
                const isConfirmed = confirmedSeats.some(
                    (s) => s.seatNumber === parseInt(seatElement.dataset.seatNumber)
                );

                if (isConfirmed) {
                    alert("この席は既に確定済みです。別の席を選んでください。");
                    return;
                }

                if (selectedSeat) {
                    selectedSeat.classList.remove("selected");
                }
                selectedSeat = seatElement;
                selectedSeat.classList.add("selected");
            });

            seatsContainer.appendChild(seatElement);
        });
    });

    // Handle seat submission
    submitSeatButton.addEventListener("click", () => {
        const studentNumber = parseInt(studentNumberSelect.value);
        if (!selectedSeat) {
            alert("席を選択してください！");
            return;
        }
        const seatNumber = parseInt(selectedSeat.dataset.seatNumber);

        // Remove any previous pending seat for the same student number
        const previousSeatIndex = pendingSeats.findIndex(
            (s) => s.studentNumber === studentNumber
        );
        if (previousSeatIndex > -1) {
            pendingSeats.splice(previousSeatIndex, 1);
        }

        // Check if seat is already pending or contested
        const existingSeat = pendingSeats.find((s) => s.seatNumber === seatNumber);

        if (existingSeat) {
            alert(`席番号 ${seatNumber} は既に他の出席番号で入力されています！`);
        } else {
            pendingSeats.push({ seatNumber, studentNumber });
        }

        selectedSeat.classList.remove("selected");
        selectedSeat = null;
    });

    // Finalize seat allocations
    finalizeSeatsButton.addEventListener("click", () => {
        seatResults.innerHTML = "";

        pendingSeats.forEach(({ seatNumber, studentNumber }) => {
            confirmedSeats.push({ seatNumber, studentNumber });
        });

        pendingSeats.length = 0;

        updateSeatResults();
    });

    // Update seat results
    function updateSeatResults() {
        seatResults.innerHTML = "<h3>確定した席:</h3>";

        confirmedSeats.forEach(({ seatNumber, studentNumber }) => {
            seatResults.innerHTML += `席番号 ${seatNumber} は出席番号 ${studentNumber} 番で確定しました。<br>`;
        });

        updateSeatView();
    }

    // Toggle seat view
    toggleViewButton.addEventListener("click", () => {
        isSeatNumberView = !isSeatNumberView;
        updateSeatView();
    });

    // Update seat view
    function updateSeatView() {
        seatsContainer.querySelectorAll(".seat").forEach((seatElement) => {
            const seatNumber = parseInt(seatElement.dataset.seatNumber);
            const confirmedSeat = confirmedSeats.find(
                (s) => s.seatNumber === seatNumber
            );
            if (confirmedSeat) {
                seatElement.textContent = isSeatNumberView
                    ? seatNumber
                    : confirmedSeat.studentNumber;
            }
        });
    }
});
