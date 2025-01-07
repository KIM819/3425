document.addEventListener("DOMContentLoaded", () => {
    const seatsContainer = document.getElementById("seatsContainer");
    const studentNumberInput = document.getElementById("studentNumber");
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
const studentNumberSelect = document.getElementById("studentNumber");

// プルダウンに出席番号を動的に追加
function populateStudentNumbers() {
    for (let i = 1; i <= 39; i++) {
        const option = document.createElement("option");
        option.value = i; // 値（バリュー）
        option.textContent = `出席番号 ${i}`; // 表示されるテキスト
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
        const studentNumber = parseInt(studentNumberInput.value);
        if (!selectedSeat) {
            alert("席を選択してください！");
            return;
        }
        if (isNaN(studentNumber) || studentNumber < 1 || studentNumber > 39) {
            alert("正しい出席番号を入力してください！");
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

        // Remove from contestedSeats if it exists
        contestedSeats.forEach((seat) => {
            const index = seat.students.indexOf(studentNumber);
            if (index > -1) {
                seat.students.splice(index, 1);
                if (seat.students.length === 1) {
                    // Move back to pendingSeats if only one student remains
                    pendingSeats.push({
                        seatNumber: seat.seatNumber,
                        studentNumber: seat.students[0],
                    });
                    contestedSeats.splice(contestedSeats.indexOf(seat), 1);
                }
            }
        });

        // Check if seat is already pending or contested
        const existingSeat = pendingSeats.find((s) => s.seatNumber === seatNumber);
        const contestedSeat = contestedSeats.find((s) => s.seatNumber === seatNumber);

        if (existingSeat) {
            if (contestedSeat) {
                contestedSeat.students.push(studentNumber);
            } else {
                contestedSeats.push({
                    seatNumber,
                    students: [existingSeat.studentNumber, studentNumber],
                });
                pendingSeats.splice(pendingSeats.indexOf(existingSeat), 1);
            }
        } else if (contestedSeat) {
            contestedSeat.students.push(studentNumber);
        } else {
            pendingSeats.push({ seatNumber, studentNumber });
        }

        selectedSeat.classList.remove("selected");
        selectedSeat = null;
    });

    // Finalize seat allocations
    finalizeSeatsButton.addEventListener("click", () => {
        seatResults.innerHTML = "";

        // Confirm pending seats that are not contested
        pendingSeats.forEach(({ seatNumber, studentNumber }) => {
            confirmedSeats.push({ seatNumber, studentNumber });
        });

        // Clear pending seats
        pendingSeats.length = 0;

        updateSeatResults();
    });

    // Update seat results
    function updateSeatResults() {
        seatResults.innerHTML = "<h3>重複している席:</h3>";

        // Add contested seats first
        contestedSeats.forEach(({ seatNumber, students }) => {
            seatResults.innerHTML += `席番号${seatNumber}番は出席番号${students.join("番、")}番が重複しています。<button onclick="resolveConflict(${seatNumber})">解決</button><br>`;
        });

        seatResults.innerHTML += "<h3>確定した席:</h3>";

        // Add confirmed seats
        confirmedSeats.forEach(({ seatNumber, studentNumber }) => {
            seatResults.innerHTML += `席番号${seatNumber}番は出席番号${studentNumber}番で確定しました。<br>`;
        });

        updateSeatView();
    }

    // Resolve conflict
    window.resolveConflict = (seatNumber) => {
        const conflictIndex = contestedSeats.findIndex(
            (s) => s.seatNumber === seatNumber
        );
        if (conflictIndex > -1) {
            const resolvedSeat = contestedSeats[conflictIndex];
            const studentNumber = prompt(
                `席番号${seatNumber}番をどの出席番号で確定しますか？ (${resolvedSeat.students.join(", ")})`
            );
            if (
                studentNumber &&
                resolvedSeat.students.includes(parseInt(studentNumber))
            ) {
                // Confirm seat
                confirmedSeats.push({
                    seatNumber,
                    studentNumber: parseInt(studentNumber),
                });

                // Remove from contestedSeats
                contestedSeats.splice(conflictIndex, 1);

                updateSeatResults();
                updateSeatView(); // Ensure seat view updates after resolving conflict
            } else {
                alert("正しい出席番号を入力してください！");
            }
        } else {
            alert("この席はすでに解決済みです。");
        }
    };

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
                if (isSeatNumberView) {
                    seatElement.textContent = seatNumber;
                    seatElement.classList.remove("highlight");
                } else {
                    seatElement.textContent = confirmedSeat.studentNumber;
                    seatElement.classList.add("highlight");
                }
            }
        });
    }
});
