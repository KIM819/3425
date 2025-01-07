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

        // 重複をチェックして、既存のエントリを更新
        const existingEntryIndex = pendingSeats.findIndex(
            (s) => s.studentNumber === studentNumber
        );
        if (existingEntryIndex > -1) {
            pendingSeats.splice(existingEntryIndex, 1);
        }

        // 重複チェック：既に同じ席番号が存在するか
        const existingSeatIndex = pendingSeats.findIndex(
            (s) => s.seatNumber === seatNumber
        );

        if (existingSeatIndex > -1) {
            // コンテスト状態に移行
            const existingSeat = pendingSeats[existingSeatIndex];
            pendingSeats.splice(existingSeatIndex, 1);
            contestedSeats.push({
                seatNumber,
                students: [existingSeat.studentNumber, studentNumber],
            });
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

            // Remove confirmed student number from dropdown
            const optionToRemove = studentNumberSelect.querySelector(
                `option[value="${studentNumber}"]`
            );
            if (optionToRemove) {
                optionToRemove.remove();
            }
        });

        // Clear pending seats
        pendingSeats.length = 0;

        updateSeatResults();
    });

    // Update seat results
    function updateSeatResults() {
        seatResults.innerHTML = "<h3>確定した席:</h3>";

        confirmedSeats.forEach(({ seatNumber, studentNumber }) => {
            seatResults.innerHTML += `席番号 ${seatNumber} は出席番号 ${studentNumber} 番で確定しました。<br>`;
        });

        seatResults.innerHTML += "<h3>重複している席:</h3>";

        contestedSeats.forEach(({ seatNumber, students }) => {
            seatResults.innerHTML += `席番号 ${seatNumber} は出席番号 ${students.join(
                "番、"
            )}番が重複しています。<button onclick="resolveConflict(${seatNumber})">解決</button><br>`;
        });

        updateSeatView();
    }

    // Resolve conflict manually
    window.resolveConflict = (seatNumber) => {
        const conflictIndex = contestedSeats.findIndex(
            (s) => s.seatNumber === seatNumber
        );
        if (conflictIndex > -1) {
            const resolvedSeat = contestedSeats[conflictIndex];
            const studentNumber = prompt(
                `席番号 ${seatNumber} をどの出席番号で確定しますか？ (${resolvedSeat.students.join(", ")})`
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

                // Remove confirmed student from dropdown
                const optionToRemove = studentNumberSelect.querySelector(
                    `option[value="${studentNumber}"]`
                );
                if (optionToRemove) {
                    optionToRemove.remove();
                }

                // Return remaining students to pending list
                resolvedSeat.students.forEach((s) => {
                    if (s !== parseInt(studentNumber)) {
                        pendingSeats.push({ seatNumber: null, studentNumber: s });
                    }
                });

                // Remove the contested seat
                contestedSeats.splice(conflictIndex, 1);

                updateSeatResults();
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
                seatElement.textContent = isSeatNumberView
                    ? seatNumber
                    : confirmedSeat.studentNumber;
                seatElement.classList.add("highlight");
            }
        });
    }
});

