/**
 * 6 to 8th Consolidated Marks Register Portal Script
 * Auto-Calculation, Save/Restore Engine for 6 Subjects
 * Designed by : LAKSHMIKANTH R (Mob:9844444871)
 */

let studentCount = 0;

document.addEventListener("DOMContentLoaded", () => {
    // Restore saved data or create initial student block
    if (!loadSavedData()) {
        addNewStudent();
    }
});

function addNewStudent(savedData = null) {
    studentCount++;
    const tbody = document.getElementById("studentTableBody");
    const blockId = `student_${studentCount}`;

    // 6 to 8th Weightages and Maximums (Max Marks per subject: FA=10, SA=30, SEM Total=50, Final=100)
    const examList = [
        { name: "FA-1", sem: "SEM-1", pct: "10%", subMax: 10, totalMax: 60, allowCo: true },
        { name: "FA-2", sem: "SEM-1", pct: "10%", subMax: 10, totalMax: 60, allowCo: false },
        { name: "SA-1", sem: "SEM-1", pct: "30%", subMax: 30, totalMax: 180, allowCo: false },
        { name: "SEM-1", sem: "SEM-1", pct: "50%", subMax: 50, totalMax: 300, isTotal: true, allowCo: false },
        { name: "FA-3", sem: "SEM-2", pct: "10%", subMax: 10, totalMax: 60, allowCo: false },
        { name: "FA-4", sem: "SEM-2", pct: "10%", subMax: 10, totalMax: 60, allowCo: false },
        { name: "SA-2", sem: "SEM-2", pct: "30%", subMax: 30, totalMax: 180, allowCo: true },
        { name: "SEM-2", sem: "SEM-2", pct: "50%", subMax: 50, totalMax: 300, isTotal: true, allowCo: false },
        { name: "SEM 1+2", sem: "SEM 1+2", pct: "100%", subMax: 100, totalMax: 600, isFinal: true, allowCo: false }
    ];

    examList.forEach((exam, idx) => {
        const tr = document.createElement("tr");
        tr.classList.add(blockId);
        if (exam.isTotal) tr.classList.add("sem-total");
        if (exam.isFinal) tr.classList.add("final-total");

        let rowHtml = "";

        // Merge student metadata across 9 sub-rows
        if (idx === 0) {
            const nameVal = savedData ? savedData.name : `STUDENT NAME ${studentCount}`;
            const presVal = savedData ? savedData.presentDays : "210";
            const totVal = savedData ? savedData.totalDays : "220";

            rowHtml += `<td rowspan="9">${studentCount}</td>`;
            rowHtml += `<td rowspan="9"><input type="text" id="${blockId}_name" class="saveable" value="${nameVal}"></td>`;
            rowHtml += `<td rowspan="9"><input type="number" id="${blockId}_present" class="saveable" value="${presVal}"></td>`;
            rowHtml += `<td rowspan="9"><input type="number" id="${blockId}_total" class="saveable" value="${totVal}"></td>`;
        }

        rowHtml += `<td>${exam.sem}</td>`;
        rowHtml += `<td><strong>${exam.name}</strong></td>`;
        rowHtml += `<td>${exam.pct}</td>`;

        // 6 Core Subjects: Kannada, English, Hindi, Maths, Science, Social Science
        const subjects = ["kan", "eng", "hin", "mat", "sci", "soc"];
        subjects.forEach(sub => {
            if (exam.isTotal || exam.isFinal) {
                rowHtml += `<td id="${blockId}_${sub}_m_${idx}">0</td>`;
            } else {
                const markVal = (savedData && savedData.marks && savedData.marks[sub]) ? savedData.marks[sub][idx] : 0;
                rowHtml += `<td><input type="number" class="mark-input saveable ${blockId}_input ${sub}" id="${blockId}_${sub}_in_${idx}" data-exam="${idx}" value="${markVal}" min="0" max="${exam.subMax}"></td>`;
            }
            rowHtml += `<td id="${blockId}_${sub}_g_${idx}">-</td>`;
        });

        // Totals & Grades
        rowHtml += `<td id="${blockId}_tot_m_${idx}">0</td>`;
        rowHtml += `<td id="${blockId}_tot_p_${idx}">0%</td>`;
        rowHtml += `<td id="${blockId}_tot_g_${idx}">-</td>`;

        // Co-Curricular Grades (FA-1 AND SA-2 rows enabled)
        if (exam.allowCo) {
            const coList = savedData ? (idx === 0 ? savedData.coFa1 : savedData.coSa2) : ["A", "A", "A", "A", "A"];
            for (let c = 0; c < 5; c++) {
                rowHtml += `<td><input type="text" id="${blockId}_co_${idx}_${c}" class="cocurricular-input saveable" value="${coList[c]}"></td>`;
            }
        } else {
            rowHtml += `<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>`;
        }

        // Result column merged across 9 rows
        if (idx === 0) {
            rowHtml += `<td rowspan="9" id="${blockId}_result" style="font-weight:bold;">PENDING</td>`;
        }

        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });

    // Event listeners for auto calculation
    document.querySelectorAll(`.${blockId}_input`).forEach(input => {
        input.addEventListener("input", () => calculateStudentData(blockId));
    });

    calculateStudentData(blockId);
}

function getGrade(percentage) {
    if (percentage >= 85) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 50) return "B+";
    if (percentage >= 35) return "B";
    return "C";
}

function calculateStudentData(blockId) {
    const subjects = ["kan", "eng", "hin", "mat", "sci", "soc"];
    const subMaxMarks = [10, 10, 30, 50, 10, 10, 30, 50, 100];
    const totalMaxMarks = [60, 60, 180, 300, 60, 60, 180, 300, 600];

    let marks = { kan: Array(9).fill(0), eng: Array(9).fill(0), hin: Array(9).fill(0), mat: Array(9).fill(0), sci: Array(9).fill(0), soc: Array(9).fill(0) };

    document.querySelectorAll(`.${blockId}_input`).forEach(input => {
        const sub = input.classList[3];
        const examIdx = parseInt(input.dataset.exam);
        const val = parseFloat(input.value) || 0;
        marks[sub][examIdx] = val;

        const grade = getGrade((val / subMaxMarks[examIdx]) * 100);
        const gElem = document.getElementById(`${blockId}_${sub}_g_${examIdx}`);
        if (gElem) gElem.innerText = grade;
    });

    // Sum Semester Totals
    subjects.forEach(sub => {
        marks[sub][3] = marks[sub][0] + marks[sub][1] + marks[sub][2]; // SEM 1
        marks[sub][7] = marks[sub][4] + marks[sub][5] + marks[sub][6]; // SEM 2
        marks[sub][8] = marks[sub][3] + marks[sub][7];                 // CONSOLIDATED

        [3, 7, 8].forEach(idx => {
            const mElem = document.getElementById(`${blockId}_${sub}_m_${idx}`);
            const gElem = document.getElementById(`${blockId}_${sub}_g_${idx}`);
            if (mElem) mElem.innerText = marks[sub][idx];
            if (gElem) gElem.innerText = getGrade((marks[sub][idx] / subMaxMarks[idx]) * 100);
        });
    });

    // Row Totals, Percentages, and Grades
    for (let i = 0; i < 9; i++) {
        const tot = marks.kan[i] + marks.eng[i] + marks.hin[i] + marks.mat[i] + marks.sci[i] + marks.soc[i];
        const pct = (tot / totalMaxMarks[i]) * 100;
        const grade = getGrade(pct);

        const tm = document.getElementById(`${blockId}_tot_m_${i}`);
        const tp = document.getElementById(`${blockId}_tot_p_${i}`);
        const tg = document.getElementById(`${blockId}_tot_g_${i}`);

        if (tm) tm.innerText = tot;
        if (tp) tp.innerText = pct.toFixed(1) + "%";
        if (tg) tg.innerText = grade;
    }

    // Determine Final Result
    const finalTot = marks.kan[8] + marks.eng[8] + marks.hin[8] + marks.mat[8] + marks.sci[8] + marks.soc[8];
    const finalPct = (finalTot / 600) * 100;
    const resCell = document.getElementById(`${blockId}_result`);
    if (resCell) {
        if (finalPct >= 35) {
            resCell.innerText = "PASS";
            resCell.style.color = "green";
        } else {
            resCell.innerText = "FAIL";
            resCell.style.color = "red";
        }
    }
}

// LocalStorage Save & Load Engine
function saveData() {
    const dataToSave = {
        schoolName: document.getElementById("schoolName").value,
        talukName: document.getElementById("talukName").value,
        districtName: document.getElementById("districtName").value,
        className: document.getElementById("className")?.value || "6TH",
        studentCount: studentCount,
        students: []
    };

    for (let i = 1; i <= studentCount; i++) {
        const blockId = `student_${i}`;
        let studentData = {
            name: document.getElementById(`${blockId}_name`)?.value || "",
            presentDays: document.getElementById(`${blockId}_present`)?.value || "",
            totalDays: document.getElementById(`${blockId}_total`)?.value || "",
            marks: { kan: [], eng: [], hin: [], mat: [], sci: [], soc: [] },
            coFa1: [],
            coSa2: []
        };

        const subjects = ["kan", "eng", "hin", "mat", "sci", "soc"];
        subjects.forEach(sub => {
            [0, 1, 2, 4, 5, 6].forEach(examIdx => {
                const val = document.getElementById(`${blockId}_${sub}_in_${examIdx}`)?.value || 0;
                studentData.marks[sub][examIdx] = parseFloat(val);
            });
        });

        for (let c = 0; c < 5; c++) {
            studentData.coFa1.push(document.getElementById(`${blockId}_co_0_${c}`)?.value || "A");
            studentData.coSa2.push(document.getElementById(`${blockId}_co_6_${c}`)?.value || "A");
        }

        dataToSave.students.push(studentData);
    }

    localStorage.setItem("marksRegisterData_6_8", JSON.stringify(dataToSave));
    alert("✅ Data Saved Successfully! Your entries will remain saved in this browser.");
}

function loadSavedData() {
    const savedString = localStorage.getItem("marksRegisterData_6_8");
    if (!savedString) return false;

    const data = JSON.parse(savedString);
    document.getElementById("schoolName").value = data.schoolName || "";
    document.getElementById("talukName").value = data.talukName || "";
    document.getElementById("districtName").value = data.districtName || "";
    if (document.getElementById("className")) document.getElementById("className").value = data.className || "6TH";

    document.getElementById("studentTableBody").innerHTML = "";
    studentCount = 0;

    data.students.forEach(sData => {
        addNewStudent(sData);
    });

    return true;
}
