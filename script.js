// Ensure jsPDF is loaded before use
const { jsPDF } = window.jspdf;

document.getElementById('sprintForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden'); // Show loading overlay

    // Collect all form data
    const formData = new FormData(event.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        // Handle checkbox groups separately
        if (key.endsWith('_type')) {
            if (!data[key]) {
                data[key] = [];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }

    // Function to generate PDF
    async function generatePdfReport(formData) {
        const doc = new jsPDF();
        let yPos = 20; // Initial Y position for content
        const margin = 20;
        const lineHeight = 7; // Standard line height for text

        // Font sizes
        const mainTitleSize = 24;
        const sectionTitleSize = 18;
        const subSectionTitleSize = 14;
        const questionSize = 12;
        const answerSize = 10;

        // Spacing constants
        const gapAfterMainTitle = 15;
        const gapAfterSubtitle = 12;
        const gapAfterSectionTitle = 8;
        const gapAfterSubSectionTitle = 5;
        const gapBetweenQuestionAndAnswer = 0.5; // Further reduced spacing here
        const gapAfterAnswerBlock = 0; // Also slightly reduced


        // Function to add a new page with dark background
        const addNewPage = () => {
            doc.addPage();
            yPos = margin; // Reset yPos for new page
            // Set dark background for the new page
            doc.setFillColor(26, 32, 44); // Corresponds to #1a202c
            doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
        };

        // Add the initial page background
        doc.setFillColor(26, 32, 44); // Corresponds to #1a202c
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');


        // Add Logo to PDF
        const img = new Image();
        img.src = 'http://googleusercontent.com/file_content/1'; // URL for the uploaded logo
        img.onerror = () => {
            console.error("Failed to load image for PDF. Using fallback text.");
            // Fallback if image fails to load
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor('#08ABF1'); // Use one of the provided colors
            doc.text('EVERLEAD IQ', margin, yPos);
            yPos += 10;
            addPdfContent(); // Continue with PDF content generation
        };
        img.onload = () => {
            const imgWidth = 50; // Desired width in PDF units
            const imgHeight = (img.height * imgWidth) / img.width; // Maintain aspect ratio

            // Ensure there's space for the logo and title on the current page
            if (yPos + imgHeight + mainTitleSize + gapAfterMainTitle + 10 > doc.internal.pageSize.height - margin) {
                addNewPage(); // Add new page if not enough space
            }

            doc.addImage(img, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10; // Space after logo

            addPdfContent(); // Continue with PDF content generation
        };

        // Function to add the rest of the PDF content
        function addPdfContent() {
            // Main Title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(mainTitleSize);
            doc.setTextColor('#08ABF1'); // Use vibrant blue for main title
            doc.text('Strategic Sprint Planner Report', margin, yPos);
            yPos += gapAfterMainTitle;

            // Subtitle
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor('#e2e8f0'); // Light text color for subtitle
            doc.text('Your 90-Day Strategic Sprint Summary', margin, yPos);
            yPos += gapAfterSubtitle;

            // Helper to add a main section header (e.g., "1. Strategic Anchor")
            const addSectionHeader = (title) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(sectionTitleSize);
                doc.setTextColor('#08ABF1');
                const lines = doc.splitTextToSize(title, 170);
                const heightNeeded = (lines.length * lineHeight) + gapAfterSectionTitle;

                if (yPos + heightNeeded > doc.internal.pageSize.height - margin) {
                    addNewPage();
                }
                doc.text(lines, margin, yPos);
                yPos += (lines.length * lineHeight) + gapAfterSectionTitle;
            };

            // Helper to add a sub-section header (e.g., "Outcome 1: [Name]")
            const addSubSectionHeader = (title) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(subSectionTitleSize);
                doc.setTextColor('#08ABF1');
                const lines = doc.splitTextToSize(title, 170);
                const heightNeeded = (lines.length * lineHeight) + gapAfterSubSectionTitle;

                if (yPos + heightNeeded > doc.internal.pageSize.height - margin) {
                    addNewPage();
                }
                doc.text(lines, margin, yPos);
                yPos += (lines.length * lineHeight) + gapAfterSubSectionTitle;
            };

            // Helper to add a question and its answer
            const addQuestionAnswer = (question, answer) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(questionSize);
                doc.setTextColor('#03CDC9');
                const questionLines = doc.splitTextToSize(question, 170);
                const questionHeight = questionLines.length * lineHeight;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(answerSize);
                doc.setTextColor('#e2e8f0');
                const answerLines = doc.splitTextToSize(answer || 'N/A', 165); // Indent answers by 5 units
                const answerHeight = answerLines.length * lineHeight;

                const heightNeeded = questionHeight + gapBetweenQuestionAndAnswer + answerHeight + gapAfterAnswerBlock;

                if (yPos + heightNeeded > doc.internal.pageSize.height - margin) {
                    addNewPage();
                }

                // Draw question
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(questionSize);
                doc.setTextColor('#03CDC9');
                doc.text(questionLines, margin, yPos);
                yPos += questionHeight + gapBetweenQuestionAndAnswer;

                // Draw answer
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(answerSize);
                doc.setTextColor('#e2e8f0');
                doc.text(answerLines, margin + 5, yPos); // Indent answers slightly
                yPos += answerHeight + gapAfterAnswerBlock;
            };

            // 1. Strategic Anchor
            addSectionHeader('1. Strategic Anchor');
            addQuestionAnswer('What are you building and why does it matter?', formData.strategicAnchor_whatBuilding);
            addQuestionAnswer('What must be true 90 days from now for this quarter to feel meaningful?', formData.strategicAnchor_90DaysMeaningful);
            addQuestionAnswer('Legacy alignment check-in:', formData.strategicAnchor_legacyAlignment);
            addQuestionAnswer('Organizational maturity level:', formData.strategicAnchor_maturityLevel);
            addQuestionAnswer('Sector/system opportunities to watch:', formData.strategicAnchor_opportunities);

            // 2. Outcomes That Matter
            addSectionHeader('2. Outcomes That Matter');
            for (let i = 1; i <= 3; i++) {
                const outcomeName = formData[`outcome${i}_name`];
                const whyMatters = formData[`outcome${i}_whyMatters`];
                const outcomeTypes = formData[`outcome${i}_type`] ? formData[`outcome${i}_type`].join(', ') : 'N/A';

                if (outcomeName) {
                    addSubSectionHeader(`Outcome ${i}: ${outcomeName}`);
                    addQuestionAnswer('Why it matters:', whyMatters);
                    addQuestionAnswer('Is it:', outcomeTypes);
                }
            }

            // 3. Critical Decisions
            addSectionHeader('3. Critical Decisions');
            for (let i = 1; i <= 2; i++) {
                const decisionName = formData[`decision${i}_name`];
                const owner = formData[`decision${i}_owner`];
                const costOfDelay = formData[`decision${i}_costOfDelay`];
                const consensusConviction = formData[`decision${i}_consensusConviction`];

                if (decisionName) {
                    addSubSectionHeader(`Decision ${i}: ${decisionName}`);
                    addQuestionAnswer('Owner:', owner);
                    addQuestionAnswer('Cost of delay:', costOfDelay);
                    addQuestionAnswer('Consensus or conviction?:', consensusConviction);
                }
            }

            // 4. Tactical Path & Guardrails
            addSectionHeader('4. Tactical Path & Guardrails');
            for (let i = 1; i <= 5; i++) {
                const action = formData[`action${i}`];
                if (action) {
                    addQuestionAnswer(`Action ${i}:`, action);
                }
            }
            addQuestionAnswer('What will you say \'no\' to this quarter to stay focused?', formData.sayNo);
            addQuestionAnswer('What resources or permissions do you need?', formData.resourcesPermissions);

            // 5. Weekly Traction Pulse
            addSectionHeader('5. Weekly Traction Pulse (Repeat Weekly)');
            addQuestionAnswer('What moved forward this week?', formData.movedForward);
            addQuestionAnswer('What stalled - and why?', formData.stalledWhy);
            addQuestionAnswer('What needs reinforcement, reallocation, or removal?', formData.reinforcementReallocationRemoval);

            // 6. Leadership Reflection Journal
            addSectionHeader('6. Leadership Reflection Journal (End of Quarter)');
            addQuestionAnswer('What did I learn about my leadership?', formData.learnedAboutLeadership);
            addQuestionAnswer('What surprised me about my decision-making?', formData.surprisedByDecisionMaking);
            addQuestionAnswer('What do I want to carry forward?', formData.carryForward);
            addQuestionAnswer('What must I let go of?', formData.letGoOf);

            doc.save('Strategic_Sprint_Report.pdf');
            loadingOverlay.classList.add('hidden'); // Hide loading overlay
        }
    }

    // Simulate a delay for PDF generation (remove in production if not needed)
    setTimeout(() => {
        generatePdfReport(data);
    }, 1000); // 1 second delay
});



