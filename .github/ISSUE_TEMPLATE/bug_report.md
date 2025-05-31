name: Bug
description: File a bug report
body:
  - type: markdown
    attributes:
      value: |
        Before opening a bug report, please search for the behaviour in the existing issues. 
        
        ---
        
        Thank you for taking the time to file a bug report. To address this bug as fast as possible, we need some information.
  name: Sample form
description: Create an issue. 
title: "[Bug]: "
labels: [bug]
assignees:
  - octocat
body:
  - type: input
    id: sample-input
    attributes:
      label: Sample Input
      description: Write text here.
      placeholder: Here will be text
    validations:
      required: true
