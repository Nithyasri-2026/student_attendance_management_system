// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
    "https://ymvlmdwuyixqsukfpplj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_kpl9p6UoOUCjUb6U5MfP3Q_FuXOAwu0";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// DOM ELEMENTS
// ==========================================

const attendanceForm =
    document.getElementById("attendanceForm");

const searchForm =
    document.getElementById("searchForm");

const message =
    document.getElementById("message");

const result =
    document.getElementById("result");

const markButton =
    document.getElementById("markButton");


// ==========================================
// MARK ATTENDANCE
// ==========================================

attendanceForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const studentId =
            document.getElementById("studentId")
                .value
                .trim();

        const subject =
            document.getElementById("subject")
                .value
                .trim();

        const status =
            document.getElementById("status")
                .value;


        // Validation
        if (!studentId || !subject) {

            showMessage(
                "⚠️ Please fill in all fields.",
                "error"
            );

            return;
        }


        // Loading state
        markButton.disabled = true;

        markButton.innerText =
            "Saving...";


        try {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            const { error } =
                await supabaseClient
                    .from("attendance")
                    .insert([
                        {
                            student_id: studentId,
                            subject: subject,
                            status: status,
                            date: today
                        }
                    ]);


            if (error) {
                throw error;
            }


            // Success message
            showMessage(
                "✅ Attendance saved successfully!",
                "success"
            );


            // Clear form
            attendanceForm.reset();


        } catch (error) {

            console.error(
                "Attendance Error:",
                error
            );

            showMessage(
                "❌ Error: " + error.message,
                "error"
            );

        } finally {

            markButton.disabled = false;

            markButton.innerText =
                "✅ Mark Attendance";
        }
    }
);


// ==========================================
// CHECK ATTENDANCE
// ==========================================

searchForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const studentId =
            document.getElementById(
                "searchStudentId"
            )
            .value
            .trim();


        if (!studentId) {

            showResult(
                "⚠️ Please enter Student ID.",
                "error"
            );

            return;
        }


        result.innerHTML = `
            <div class="loading">
                🔄 Loading attendance...
            </div>
        `;


        try {

            const { data, error } =
                await supabaseClient
                    .from("attendance")
                    .select("*")
                    .eq(
                        "student_id",
                        studentId
                    )
                    .order(
                        "date",
                        { ascending: false }
                    );


            if (error) {
                throw error;
            }


            // No records
            if (!data || data.length === 0) {

                showResult(`
                    <div class="no-record">
                        <div class="large-icon">📭</div>

                        <h3>No Attendance Records</h3>

                        <p>
                            No attendance found for
                            <strong>${studentId}</strong>.
                        </p>
                    </div>
                `);

                return;
            }


            // Calculate attendance
            const totalClasses =
                data.length;


            const attendedClasses =
                data.filter(
                    record =>
                        record.status === "Present"
                ).length;


            const absentClasses =
                data.filter(
                    record =>
                        record.status === "Absent"
                ).length;


            const percentage =
                (attendedClasses /
                    totalClasses) * 100;


            let statusClass = "";
            let statusText = "";


            if (percentage >= 75) {

                statusClass = "good";

                statusText =
                    "✅ Attendance is above 75%.";

            } else {

                statusClass = "low";

                statusText =
                    "⚠️ Low Attendance! Please improve your attendance.";
            }


            // Display result
            result.innerHTML = `

                <div class="attendance-report">

                    <div class="student-heading">
                        <div class="student-icon">
                            👨‍🎓
                        </div>

                        <div>
                            <h3>Attendance Report</h3>

                            <p>
                                Student ID:
                                <strong>${studentId}</strong>
                            </p>
                        </div>
                    </div>


                    <div class="stats">

                        <div class="stat-box">
                            <span>📚</span>
                            <h4>${totalClasses}</h4>
                            <p>Total Classes</p>
                        </div>


                        <div class="stat-box present">
                            <span>✅</span>
                            <h4>${attendedClasses}</h4>
                            <p>Present</p>
                        </div>


                        <div class="stat-box absent">
                            <span>❌</span>
                            <h4>${absentClasses}</h4>
                            <p>Absent</p>
                        </div>

                    </div>


                    <div class="percentage">

                        <h2>
                            ${percentage.toFixed(2)}%
                        </h2>

                        <p>
                            Attendance Percentage
                        </p>

                    </div>


                    <div class="attendance-status ${statusClass}">
                        ${statusText}
                    </div>


                    <h3 class="history-title">
                        📅 Attendance History
                    </h3>


                    <div class="table-container">

                        <table>

                            <thead>

                                <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                </tr>

                            </thead>

                            <tbody>

                                ${data.map(record => `

                                    <tr>

                                        <td>
                                            ${formatDate(record.date)}
                                        </td>

                                        <td>
                                            ${record.subject}
                                        </td>

                                        <td>

                                            <span class="badge ${
                                                record.status === "Present"
                                                    ? "badge-present"
                                                    : "badge-absent"
                                            }">

                                                ${record.status}

                                            </span>

                                        </td>

                                    </tr>

                                `).join("")}

                            </tbody>

                        </table>

                    </div>

                </div>
            `;

        } catch (error) {

            console.error(
                "Search Error:",
                error
            );

            showResult(
                "❌ Unable to fetch attendance: " +
                error.message,
                "error"
            );
        }
    }
);


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    message.innerText = text;

    message.className =
        "message " + type;
}


// ==========================================
// SHOW RESULT MESSAGE
// ==========================================

function showResult(
    content,
    type = ""
) {

    result.innerHTML =
        `<div class="${type}">${content}</div>`;
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date) {
        return "-";
    }

    const formatted =
        new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    return formatted;
}