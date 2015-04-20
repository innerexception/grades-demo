define(['ractive', 'rv!/grades/src/gradeApp/gradeAppTemplate.html', 'css!/grades/src/gradeApp/gradeAppStyles'],
    function(Ractive, gradeAppTemplate){

        var gradeApp = function(containerDomId){
            var self = this;
            this.containerDomId = containerDomId;
            this._ractive = new Ractive({
                el:this.containerDomId,
                template: gradeAppTemplate,
                data: {
                    grades: [
                        {name: 'Billy', grade:65, failing:true, editing:false},
                        {name: 'Timmy', grade:75, failing:false, editing:false},
                        {name: 'Sally', grade:95, failing:false, editing:false}
                    ]
                }
            });
            //Ractive proxy events from template
            this._ractive.on({
                deleteGrade: function(event){
                    self.removeGrade(event.index.i);
                },
                newGrade: function(event){
                    var gradeInput = event.node.previousElementSibling;
                    var nameInput = gradeInput.previousElementSibling;
                    self.addGrade(nameInput.value, gradeInput.value);
                    event.node.name = '';
                    event.node.grade = '';
                },
                modifyGrade: function(event){
                    self.editGrade(event.index.i, '.grade');
                },
                modifyName: function(event){
                    self.editGrade(event.index.i, '.name');
                },
                editCompleted: function(event){
                    self._ractive.set(event.keypath + '.editing', false);
                },
                onBlur: function(event){
                    event.node.blur();
                }
            });
        };

        gradeApp.prototype = {
            addGrade: function(name, grade){
                this._ractive.data.grades.push({
                    name: name,
                    grade: grade,
                    editing: false,
                    failing: grade <= 65
                });
            },
            removeGrade: function(index){
                this._ractive.data.grades.splice(index, 1);
            },
            editGrade: function(index, fieldName){
                var keydownHandler, blurHandler,
                    input, currentValue;

                currentValue = this._ractive.get('grades.' + index + fieldName);
                this._ractive.set('grades.' + index + '.editing', true);

                input = this._ractive.find(fieldName + 'Editor');
                input.select();

                var self = this;

                window.addEventListener('keydown',
                keydownHandler = function(event){
                    switch(event.which){
                        case 13:   //Enter
                            input.blur();
                            break;
                        case 27:   //Esc
                            input.value = currentValue;
                            self._ractive.set('grades.' + index + fieldName, currentValue);
                            input.blur();
                            break;
                        case 9:    //Tab
                            event.preventDefault();
                            input.blur();
                            self.editGrade((index + 1) % self._ractive.get('grades').length, fieldName);
                            break;
                    }
                });

                input.addEventListener('blur',
                    blurHandler = function () {
                        window.removeEventListener( 'keydown', keydownHandler );
                        input.removeEventListener( 'blur', blurHandler );
                    });

                this._ractive.set('grades.' + index + '.editing', true);
            }
        };

        return gradeApp;
});