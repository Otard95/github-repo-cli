
class Quaestion {
  
  constructor (property_name, query, deafult_answer, optional = false, accepted_answers, hide_input = false, predict = false) {
    
    this.property_name = property_name;
    this.query = query;
    this.deafult_answer = deafult_answer;
    this.optional = optional;
    this.hide_input = hide_input;
    
    this.accepted_answers = Array.isArray(accepted_answers) ? accepted_answers : undefined;
    this.predict = predict;
    
  }
  
  verityAnswer(answer) {
    
    if (answer === '' && this.deafult_answer) {
      this.answer = this.deafult_answer;
      return true;
    } else if (answer === '' && !this.deafult_answer && this.optional) {
      return true;
    } else if (answer === '' && !this.deafult_answer && !this.optional) {
      return false;
    }
    
    if (!this.accepted_answers) {
      this.answer = answer;
      return true;
    }
    
    for (let i = 0; i < this.accepted_answers.length; i++) {
      if (answer === this.accepted_answers[i]) {
        this.answer = answer;
        return true;
      }
    }
    return false;
    
  }
  
}

module.exports = Quaestion;