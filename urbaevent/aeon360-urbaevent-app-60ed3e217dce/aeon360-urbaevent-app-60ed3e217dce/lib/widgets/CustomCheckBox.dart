import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/material.dart';

class CustomCheckbox extends StatefulWidget {
  final bool checked;
  final Function(bool) onChanged;
  final Image checkedImage;
  Image? uncheckedImage;

  CustomCheckbox({
    required this.checked,
    required this.onChanged,
    required this.checkedImage,
     this.uncheckedImage,
  });

  @override
  _CustomCheckboxState createState() => _CustomCheckboxState();
}

class _CustomCheckboxState extends State<CustomCheckbox> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        widget.onChanged(!widget.checked);
      },
      child: Container(
        width: 16,
        height: 16,
        decoration: BoxDecoration(
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.circular(3),
          border: Border.all(
            color: ThemeColor.colorAccent,
            width: 2,
          ),
        ),
        child: widget.checked ? widget.checkedImage : widget.checkedImage,
      ),
    );
  }
}
