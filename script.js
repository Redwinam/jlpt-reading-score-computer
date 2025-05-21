document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = document.getElementById("calculateBtn");
  calculateBtn.addEventListener("click", calculateScore);

  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      const groupId = input.id.match(/\d+/)[0];
      const totalInput = document.getElementById(`total${groupId}`);
      const correctInput = document.getElementById(`correct${groupId}`);

      if (parseInt(correctInput.value) > parseInt(totalInput.value)) {
        correctInput.value = totalInput.value;
      }
      if (parseInt(correctInput.value) < 0) {
        correctInput.value = 0;
      }
      if (parseInt(totalInput.value) < 0) {
        totalInput.value = 0;
      }
    });
  });
});

function calculateScore() {
  let totalScore = 0;
  let totalPossibleScore = 0;

  const questionGroups = [
    { id: 8, pointsPerQuestion: 2 },
    { id: 9, pointsPerQuestion: 2 },
    { id: 10, pointsPerQuestion: 3 },
    { id: 11, pointsPerQuestion: 3 },
    { id: 12, pointsPerQuestion: 3 },
    { id: 13, pointsPerQuestion: 3 },
  ];

  questionGroups.forEach((group) => {
    const totalInput = document.getElementById(`total${group.id}`);
    const correctInput = document.getElementById(`correct${group.id}`);

    const totalQuestions = parseInt(totalInput.value) || 0;
    const correctQuestions = parseInt(correctInput.value) || 0;

    if (correctQuestions > totalQuestions) {
      alert(`問題${group.id} 的答对题数不能超过总题数。`);
      correctInput.value = totalQuestions;
      return;
    }

    totalScore += correctQuestions * group.pointsPerQuestion;
    totalPossibleScore += totalQuestions * group.pointsPerQuestion;
  });

  document.getElementById("score").textContent = totalScore;
  document.getElementById("totalPossibleScore").textContent = totalPossibleScore;
}
