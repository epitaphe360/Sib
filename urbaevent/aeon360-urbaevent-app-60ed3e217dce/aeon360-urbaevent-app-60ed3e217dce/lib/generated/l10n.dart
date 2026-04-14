// GENERATED CODE - DO NOT MODIFY BY HAND
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'intl/messages_all.dart';

// **************************************************************************
// Generator: Flutter Intl IDE plugin
// Made by Localizely
// **************************************************************************

// ignore_for_file: non_constant_identifier_names, lines_longer_than_80_chars
// ignore_for_file: join_return_with_assignment, prefer_final_in_for_each
// ignore_for_file: avoid_redundant_argument_values, avoid_escaping_inner_quotes

class S {
  S();

  static S? _current;

  static S get current {
    assert(_current != null,
        'No instance of S was loaded. Try to initialize the S delegate before accessing S.current.');
    return _current!;
  }

  static const AppLocalizationDelegate delegate = AppLocalizationDelegate();

  static Future<S> load(Locale locale) {
    final name = (locale.countryCode?.isEmpty ?? false)
        ? locale.languageCode
        : locale.toString();
    final localeName = Intl.canonicalizedLocale(name);
    return initializeMessages(localeName).then((_) {
      Intl.defaultLocale = localeName;
      final instance = S();
      S._current = instance;

      return instance;
    });
  }

  static S of(BuildContext context) {
    final instance = S.maybeOf(context);
    assert(instance != null,
        'No instance of S present in the widget tree. Did you add S.delegate in localizationsDelegates?');
    return instance!;
  }

  static S? maybeOf(BuildContext context) {
    return Localizations.of<S>(context, S);
  }

  /// `Welcome to \nUrbaEvent App`
  String get welcome_msg1 {
    return Intl.message(
      'Welcome to \nUrbaEvent App',
      name: 'welcome_msg1',
      desc: '',
      args: [],
    );
  }

  /// `Stay informed of everyone \nupcoming events`
  String get welcome_sub_msg_1 {
    return Intl.message(
      'Stay informed of everyone \nupcoming events',
      name: 'welcome_sub_msg_1',
      desc: '',
      args: [],
    );
  }

  /// `From professional \nto professional`
  String get welcome_msg2 {
    return Intl.message(
      'From professional \nto professional',
      name: 'welcome_msg2',
      desc: '',
      args: [],
    );
  }

  /// `Connect with other \nprofessionals in your industry`
  String get welcome_sub_msg_2 {
    return Intl.message(
      'Connect with other \nprofessionals in your industry',
      name: 'welcome_sub_msg_2',
      desc: '',
      args: [],
    );
  }

  /// `Your online \neBadge`
  String get welcome_msg3 {
    return Intl.message(
      'Your online \neBadge',
      name: 'welcome_msg3',
      desc: '',
      args: [],
    );
  }

  /// `Request your eBadge \nin one click`
  String get welcome_sub_msg_3 {
    return Intl.message(
      'Request your eBadge \nin one click',
      name: 'welcome_sub_msg_3',
      desc: '',
      args: [],
    );
  }

  /// `Start`
  String get start {
    return Intl.message(
      'Start',
      name: 'start',
      desc: '',
      args: [],
    );
  }

  /// `Next`
  String get next {
    return Intl.message(
      'Next',
      name: 'next',
      desc: '',
      args: [],
    );
  }

  /// `Upcoming events`
  String get upcomingEvents {
    return Intl.message(
      'Upcoming events',
      name: 'upcomingEvents',
      desc: '',
      args: [],
    );
  }

  /// `My Events`
  String get myEvents {
    return Intl.message(
      'My Events',
      name: 'myEvents',
      desc: '',
      args: [],
    );
  }

  /// `To access the list of your events`
  String get accessEventMessage {
    return Intl.message(
      'To access the list of your events',
      name: 'accessEventMessage',
      desc: '',
      args: [],
    );
  }

  /// `   please`
  String get please {
    return Intl.message(
      '   please',
      name: 'please',
      desc: '',
      args: [],
    );
  }

  /// `Sign up`
  String get signup {
    return Intl.message(
      'Sign up',
      name: 'signup',
      desc: '',
      args: [],
    );
  }

  /// `Or`
  String get or {
    return Intl.message(
      'Or',
      name: 'or',
      desc: '',
      args: [],
    );
  }

  /// `Sign In`
  String get login {
    return Intl.message(
      'Sign In',
      name: 'login',
      desc: '',
      args: [],
    );
  }

  /// `You didn't registered any events yet`
  String get msg_no_events {
    return Intl.message(
      'You didn\'t registered any events yet',
      name: 'msg_no_events',
      desc: '',
      args: [],
    );
  }

  /// `Add new contacts`
  String get add_new_contacts {
    return Intl.message(
      'Add new contacts',
      name: 'add_new_contacts',
      desc: '',
      args: [],
    );
  }

  /// `Pour entrer en contact avec les autres participants de l'événement \n Scannez le QR code`
  String get header_scan {
    return Intl.message(
      'Pour entrer en contact avec les autres participants de l\'événement \n Scannez le QR code',
      name: 'header_scan',
      desc: '',
      args: [],
    );
  }

  /// `You don't have any ebadges yet`
  String get no_badges {
    return Intl.message(
      'You don\'t have any ebadges yet',
      name: 'no_badges',
      desc: '',
      args: [],
    );
  }

  /// `Please scan the correct eBadge.`
  String get pls_scan_correct_ebadge {
    return Intl.message(
      'Please scan the correct eBadge.',
      name: 'pls_scan_correct_ebadge',
      desc: '',
      args: [],
    );
  }

  /// `No permission granted`
  String get no_permission_granted {
    return Intl.message(
      'No permission granted',
      name: 'no_permission_granted',
      desc: '',
      args: [],
    );
  }

  /// `eBadges`
  String get ebadges {
    return Intl.message(
      'eBadges',
      name: 'ebadges',
      desc: '',
      args: [],
    );
  }

  /// `Profile`
  String get profile {
    return Intl.message(
      'Profile',
      name: 'profile',
      desc: '',
      args: [],
    );
  }

  /// `eBadge Details`
  String get ebadge_details {
    return Intl.message(
      'eBadge Details',
      name: 'ebadge_details',
      desc: '',
      args: [],
    );
  }

  /// `Contact Details`
  String get contact_details {
    return Intl.message(
      'Contact Details',
      name: 'contact_details',
      desc: '',
      args: [],
    );
  }

  /// `Search...`
  String get search {
    return Intl.message(
      'Search...',
      name: 'search',
      desc: '',
      args: [],
    );
  }

  /// `Contact added successfully`
  String get contact_added_successfully {
    return Intl.message(
      'Contact added successfully',
      name: 'contact_added_successfully',
      desc: '',
      args: [],
    );
  }

  /// `Logout`
  String get logout {
    return Intl.message(
      'Logout',
      name: 'logout',
      desc: '',
      args: [],
    );
  }

  /// `Are you sure you want to log out?`
  String get logout_msg {
    return Intl.message(
      'Are you sure you want to log out?',
      name: 'logout_msg',
      desc: '',
      args: [],
    );
  }

  /// `Cancel`
  String get cancel {
    return Intl.message(
      'Cancel',
      name: 'cancel',
      desc: '',
      args: [],
    );
  }

  /// `Yes`
  String get yes {
    return Intl.message(
      'Yes',
      name: 'yes',
      desc: '',
      args: [],
    );
  }

  /// `Notifications`
  String get notifications {
    return Intl.message(
      'Notifications',
      name: 'notifications',
      desc: '',
      args: [],
    );
  }

  /// `You don't have any notifications yet.`
  String get no_notifications {
    return Intl.message(
      'You don\'t have any notifications yet.',
      name: 'no_notifications',
      desc: '',
      args: [],
    );
  }

  /// `Select Profile Image`
  String get select_image {
    return Intl.message(
      'Select Profile Image',
      name: 'select_image',
      desc: '',
      args: [],
    );
  }

  /// `Camera`
  String get camera {
    return Intl.message(
      'Camera',
      name: 'camera',
      desc: '',
      args: [],
    );
  }

  /// `Gallery`
  String get gallery {
    return Intl.message(
      'Gallery',
      name: 'gallery',
      desc: '',
      args: [],
    );
  }

  /// `Profile pic updated successfully`
  String get msg_pic_uploaded {
    return Intl.message(
      'Profile pic updated successfully',
      name: 'msg_pic_uploaded',
      desc: '',
      args: [],
    );
  }

  /// `Profile pic updated Failed`
  String get msg_pic_failure {
    return Intl.message(
      'Profile pic updated Failed',
      name: 'msg_pic_failure',
      desc: '',
      args: [],
    );
  }

  /// `Information`
  String get information {
    return Intl.message(
      'Information',
      name: 'information',
      desc: '',
      args: [],
    );
  }

  /// `My scans`
  String get my_scans {
    return Intl.message(
      'My scans',
      name: 'my_scans',
      desc: '',
      args: [],
    );
  }

  /// `Change Password`
  String get change_password {
    return Intl.message(
      'Change Password',
      name: 'change_password',
      desc: '',
      args: [],
    );
  }

  /// `Password changed successfully`
  String get msg_pwd_changed {
    return Intl.message(
      'Password changed successfully',
      name: 'msg_pwd_changed',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid old password`
  String get msg_old_pwd_empty {
    return Intl.message(
      'Please enter valid old password',
      name: 'msg_old_pwd_empty',
      desc: '',
      args: [],
    );
  }

  /// `Password length should be atleast 5 chars long`
  String get msg_pwd_length {
    return Intl.message(
      'Password length should be atleast 5 chars long',
      name: 'msg_pwd_length',
      desc: '',
      args: [],
    );
  }

  /// `Confirm password cannot be empty`
  String get msg_cng_pwd_empty {
    return Intl.message(
      'Confirm password cannot be empty',
      name: 'msg_cng_pwd_empty',
      desc: '',
      args: [],
    );
  }

  /// `Password & Confirm password doesn't match`
  String get msg_pwd_no_match {
    return Intl.message(
      'Password & Confirm password doesn\'t match',
      name: 'msg_pwd_no_match',
      desc: '',
      args: [],
    );
  }

  /// `Old password`
  String get old_pwd {
    return Intl.message(
      'Old password',
      name: 'old_pwd',
      desc: '',
      args: [],
    );
  }

  /// `Confirm password`
  String get cnf_password {
    return Intl.message(
      'Confirm password',
      name: 'cnf_password',
      desc: '',
      args: [],
    );
  }

  /// `Confirm new password`
  String get confirm_new_password {
    return Intl.message(
      'Confirm new password',
      name: 'confirm_new_password',
      desc: '',
      args: [],
    );
  }

  /// `Update Password`
  String get update_pwd {
    return Intl.message(
      'Update Password',
      name: 'update_pwd',
      desc: '',
      args: [],
    );
  }

  /// `Click here to download your eBadge`
  String get click_to_download {
    return Intl.message(
      'Click here to download your eBadge',
      name: 'click_to_download',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid name`
  String get msg_valid_name {
    return Intl.message(
      'Please enter valid name',
      name: 'msg_valid_name',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid company name`
  String get msg_valid_company {
    return Intl.message(
      'Please enter valid company name',
      name: 'msg_valid_company',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid email`
  String get msg_valid_email {
    return Intl.message(
      'Please enter valid email',
      name: 'msg_valid_email',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid phone number`
  String get msg_valid_phone {
    return Intl.message(
      'Please enter valid phone number',
      name: 'msg_valid_phone',
      desc: '',
      args: [],
    );
  }

  /// `Profile Updated Successfully!`
  String get msg_profile_updated {
    return Intl.message(
      'Profile Updated Successfully!',
      name: 'msg_profile_updated',
      desc: '',
      args: [],
    );
  }

  /// `Contact Information`
  String get contact_information {
    return Intl.message(
      'Contact Information',
      name: 'contact_information',
      desc: '',
      args: [],
    );
  }

  /// `Full name`
  String get name {
    return Intl.message(
      'Full name',
      name: 'name',
      desc: '',
      args: [],
    );
  }

  /// `Company`
  String get company {
    return Intl.message(
      'Company',
      name: 'company',
      desc: '',
      args: [],
    );
  }

  /// `Business Industry`
  String get business_industry {
    return Intl.message(
      'Business Industry',
      name: 'business_industry',
      desc: '',
      args: [],
    );
  }

  /// `Email`
  String get email {
    return Intl.message(
      'Email',
      name: 'email',
      desc: '',
      args: [],
    );
  }

  /// `Phone number`
  String get phone_number {
    return Intl.message(
      'Phone number',
      name: 'phone_number',
      desc: '',
      args: [],
    );
  }

  /// `Update`
  String get update {
    return Intl.message(
      'Update',
      name: 'update',
      desc: '',
      args: [],
    );
  }

  /// `You would be notified once we confirm you as exhibitor`
  String get msg_notified_once_exhibitor {
    return Intl.message(
      'You would be notified once we confirm you as exhibitor',
      name: 'msg_notified_once_exhibitor',
      desc: '',
      args: [],
    );
  }

  /// `Presentation`
  String get presentation {
    return Intl.message(
      'Presentation',
      name: 'presentation',
      desc: '',
      args: [],
    );
  }

  /// `Program`
  String get conferences {
    return Intl.message(
      'Program',
      name: 'conferences',
      desc: '',
      args: [],
    );
  }

  /// `My schedule`
  String get my_schedule {
    return Intl.message(
      'My schedule',
      name: 'my_schedule',
      desc: '',
      args: [],
    );
  }

  /// `Portal`
  String get portal {
    return Intl.message(
      'Portal',
      name: 'portal',
      desc: '',
      args: [],
    );
  }

  /// `Map`
  String get plan {
    return Intl.message(
      'Map',
      name: 'plan',
      desc: '',
      args: [],
    );
  }

  /// `Informations`
  String get event_info {
    return Intl.message(
      'Informations',
      name: 'event_info',
      desc: '',
      args: [],
    );
  }

  /// `Download my eBadge`
  String get download_e_badge {
    return Intl.message(
      'Download my eBadge',
      name: 'download_e_badge',
      desc: '',
      args: [],
    );
  }

  /// `Book a booth`
  String get book_booth {
    return Intl.message(
      'Book a booth',
      name: 'book_booth',
      desc: '',
      args: [],
    );
  }

  /// `You need to register for the event in-order to view schedule.`
  String get msg_register_first {
    return Intl.message(
      'You need to register for the event in-order to view schedule.',
      name: 'msg_register_first',
      desc: '',
      args: [],
    );
  }

  /// `There aren't any program available at the moment`
  String get no_conferences {
    return Intl.message(
      'There aren\'t any program available at the moment',
      name: 'no_conferences',
      desc: '',
      args: [],
    );
  }

  /// `Your feedback will help us to make improvements`
  String get your_feedback {
    return Intl.message(
      'Your feedback will help us to make improvements',
      name: 'your_feedback',
      desc: '',
      args: [],
    );
  }

  /// `Time`
  String get time {
    return Intl.message(
      'Time',
      name: 'time',
      desc: '',
      args: [],
    );
  }

  /// `Date`
  String get date {
    return Intl.message(
      'Date',
      name: 'date',
      desc: '',
      args: [],
    );
  }

  /// `Participants`
  String get participants {
    return Intl.message(
      'Participants',
      name: 'participants',
      desc: '',
      args: [],
    );
  }

  /// `Venue`
  String get venue {
    return Intl.message(
      'Venue',
      name: 'venue',
      desc: '',
      args: [],
    );
  }

  /// `Assist`
  String get assist {
    return Intl.message(
      'Assist',
      name: 'assist',
      desc: '',
      args: [],
    );
  }

  /// `Successfully registered for the program.`
  String get msg_reg_conference {
    return Intl.message(
      'Successfully registered for the program.',
      name: 'msg_reg_conference',
      desc: '',
      args: [],
    );
  }

  /// `Delete`
  String get delete {
    return Intl.message(
      'Delete',
      name: 'delete',
      desc: '',
      args: [],
    );
  }

  /// `Are you sure you want to delete this collaborator?`
  String get msg_delete_collaborator {
    return Intl.message(
      'Are you sure you want to delete this collaborator?',
      name: 'msg_delete_collaborator',
      desc: '',
      args: [],
    );
  }

  /// `Associate added successful!`
  String get msg_associate_added {
    return Intl.message(
      'Associate added successful!',
      name: 'msg_associate_added',
      desc: '',
      args: [],
    );
  }

  /// `Associate updated successfully`
  String get msg_associate_updated {
    return Intl.message(
      'Associate updated successfully',
      name: 'msg_associate_updated',
      desc: '',
      args: [],
    );
  }

  /// `Associate deletion successfully`
  String get msg_associate_deleted {
    return Intl.message(
      'Associate deletion successfully',
      name: 'msg_associate_deleted',
      desc: '',
      args: [],
    );
  }

  /// `Edit`
  String get edit {
    return Intl.message(
      'Edit',
      name: 'edit',
      desc: '',
      args: [],
    );
  }

  /// `My associates`
  String get my_associates {
    return Intl.message(
      'My associates',
      name: 'my_associates',
      desc: '',
      args: [],
    );
  }

  /// `+ Add`
  String get add {
    return Intl.message(
      '+ Add',
      name: 'add',
      desc: '',
      args: [],
    );
  }

  /// `There aren't any associates added`
  String get no_associates {
    return Intl.message(
      'There aren\'t any associates added',
      name: 'no_associates',
      desc: '',
      args: [],
    );
  }

  /// `You haven't registered for any program yet!`
  String get no_schedule {
    return Intl.message(
      'You haven\'t registered for any program yet!',
      name: 'no_schedule',
      desc: '',
      args: [],
    );
  }

  /// `There aren't any portals available.`
  String get no_portals {
    return Intl.message(
      'There aren\'t any portals available.',
      name: 'no_portals',
      desc: '',
      args: [],
    );
  }

  /// `Please enter the received code in the email sent to`
  String get pls_enter_email_code {
    return Intl.message(
      'Please enter the received code in the email sent to',
      name: 'pls_enter_email_code',
      desc: '',
      args: [],
    );
  }

  /// `Code not received?`
  String get code_not_received {
    return Intl.message(
      'Code not received?',
      name: 'code_not_received',
      desc: '',
      args: [],
    );
  }

  /// `resend`
  String get resend {
    return Intl.message(
      'resend',
      name: 'resend',
      desc: '',
      args: [],
    );
  }

  /// `Send`
  String get send {
    return Intl.message(
      'Send',
      name: 'send',
      desc: '',
      args: [],
    );
  }

  /// `Email Verification`
  String get email_verification {
    return Intl.message(
      'Email Verification',
      name: 'email_verification',
      desc: '',
      args: [],
    );
  }

  /// `Account created!`
  String get account_created {
    return Intl.message(
      'Account created!',
      name: 'account_created',
      desc: '',
      args: [],
    );
  }

  /// `Your account has been created successfully.`
  String get your_account_created {
    return Intl.message(
      'Your account has been created successfully.',
      name: 'your_account_created',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid email address`
  String get msg_enter_email {
    return Intl.message(
      'Please enter valid email address',
      name: 'msg_enter_email',
      desc: '',
      args: [],
    );
  }

  /// `Password length should be atleast 5 chars`
  String get msg_enter_pwd {
    return Intl.message(
      'Password length should be atleast 5 chars',
      name: 'msg_enter_pwd',
      desc: '',
      args: [],
    );
  }

  /// `Sign In`
  String get sign_in {
    return Intl.message(
      'Sign In',
      name: 'sign_in',
      desc: '',
      args: [],
    );
  }

  /// `Forgot password?`
  String get forgot_password {
    return Intl.message(
      'Forgot password?',
      name: 'forgot_password',
      desc: '',
      args: [],
    );
  }

  /// `You don’t have an account?`
  String get you_dont_have_account {
    return Intl.message(
      'You don’t have an account?',
      name: 'you_dont_have_account',
      desc: '',
      args: [],
    );
  }

  /// `Sign Up`
  String get sign_up {
    return Intl.message(
      'Sign Up',
      name: 'sign_up',
      desc: '',
      args: [],
    );
  }

  /// `Sign In`
  String get login_ {
    return Intl.message(
      'Sign In',
      name: 'login_',
      desc: '',
      args: [],
    );
  }

  /// `You already have an account?`
  String get you_have_account {
    return Intl.message(
      'You already have an account?',
      name: 'you_have_account',
      desc: '',
      args: [],
    );
  }

  /// `Function`
  String get function {
    return Intl.message(
      'Function',
      name: 'function',
      desc: '',
      args: [],
    );
  }

  /// `Business sector`
  String get business_sector {
    return Intl.message(
      'Business sector',
      name: 'business_sector',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid business sector`
  String get msg_valid_business_sector {
    return Intl.message(
      'Please enter valid business sector',
      name: 'msg_valid_business_sector',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid function`
  String get msg_valid_function {
    return Intl.message(
      'Please enter valid function',
      name: 'msg_valid_function',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid country`
  String get msg_valid_country {
    return Intl.message(
      'Please enter valid country',
      name: 'msg_valid_country',
      desc: '',
      args: [],
    );
  }

  /// `Please enter valid name`
  String get msg_enter_name {
    return Intl.message(
      'Please enter valid name',
      name: 'msg_enter_name',
      desc: '',
      args: [],
    );
  }

  /// `Delete Account`
  String get delete_account {
    return Intl.message(
      'Delete Account',
      name: 'delete_account',
      desc: '',
      args: [],
    );
  }

  /// `My Contacts`
  String get my_contacts {
    return Intl.message(
      'My Contacts',
      name: 'my_contacts',
      desc: '',
      args: [],
    );
  }

  /// `Are you sure you want to delete this account? This action would be irreversible.`
  String get msg_delete_account {
    return Intl.message(
      'Are you sure you want to delete this account? This action would be irreversible.',
      name: 'msg_delete_account',
      desc: '',
      args: [],
    );
  }

  /// `Event Information`
  String get event_information {
    return Intl.message(
      'Event Information',
      name: 'event_information',
      desc: '',
      args: [],
    );
  }

  /// `Accommodation`
  String get accommodation {
    return Intl.message(
      'Accommodation',
      name: 'accommodation',
      desc: '',
      args: [],
    );
  }

  /// `Exhibition Location`
  String get exhibitionLocation {
    return Intl.message(
      'Exhibition Location',
      name: 'exhibitionLocation',
      desc: '',
      args: [],
    );
  }

  /// `You haven't scanned any eBadge yet!`
  String get no_scans {
    return Intl.message(
      'You haven\'t scanned any eBadge yet!',
      name: 'no_scans',
      desc: '',
      args: [],
    );
  }

  /// `Assisting`
  String get assisting {
    return Intl.message(
      'Assisting',
      name: 'assisting',
      desc: '',
      args: [],
    );
  }

  /// `Day`
  String get day {
    return Intl.message(
      'Day',
      name: 'day',
      desc: '',
      args: [],
    );
  }

  /// `View`
  String get view {
    return Intl.message(
      'View',
      name: 'view',
      desc: '',
      args: [],
    );
  }

  /// `Hall`
  String get hall {
    return Intl.message(
      'Hall',
      name: 'hall',
      desc: '',
      args: [],
    );
  }

  /// `Booth`
  String get booth {
    return Intl.message(
      'Booth',
      name: 'booth',
      desc: '',
      args: [],
    );
  }

  /// `loading...`
  String get loading {
    return Intl.message(
      'loading...',
      name: 'loading',
      desc: '',
      args: [],
    );
  }

  /// `Ok`
  String get ok {
    return Intl.message(
      'Ok',
      name: 'ok',
      desc: '',
      args: [],
    );
  }

  /// `Please scan a correct eBadge`
  String get msg_scan_correct_ebadge {
    return Intl.message(
      'Please scan a correct eBadge',
      name: 'msg_scan_correct_ebadge',
      desc: '',
      args: [],
    );
  }

  /// `Password`
  String get password {
    return Intl.message(
      'Password',
      name: 'password',
      desc: '',
      args: [],
    );
  }

  /// `Entry Hour`
  String get entry_hour {
    return Intl.message(
      'Entry Hour',
      name: 'entry_hour',
      desc: '',
      args: [],
    );
  }

  /// `eBadge Type`
  String get ebadge_type {
    return Intl.message(
      'eBadge Type',
      name: 'ebadge_type',
      desc: '',
      args: [],
    );
  }

  /// `A code will be sent to your mailbox to recover your password`
  String get msg_email_sent_to {
    return Intl.message(
      'A code will be sent to your mailbox to recover your password',
      name: 'msg_email_sent_to',
      desc: '',
      args: [],
    );
  }

  /// `Continue with Google`
  String get connect_with_google {
    return Intl.message(
      'Continue with Google',
      name: 'connect_with_google',
      desc: '',
      args: [],
    );
  }

  /// `Continue with Linkedin`
  String get connect_with_linkedin {
    return Intl.message(
      'Continue with Linkedin',
      name: 'connect_with_linkedin',
      desc: '',
      args: [],
    );
  }

  /// `Continue with Apple`
  String get connect_with_apple {
    return Intl.message(
      'Continue with Apple',
      name: 'connect_with_apple',
      desc: '',
      args: [],
    );
  }

  /// ` Years ago`
  String get years_ago {
    return Intl.message(
      ' Years ago',
      name: 'years_ago',
      desc: '',
      args: [],
    );
  }

  /// ` Months ago`
  String get months_ago {
    return Intl.message(
      ' Months ago',
      name: 'months_ago',
      desc: '',
      args: [],
    );
  }

  /// ` Days ago`
  String get days_ago {
    return Intl.message(
      ' Days ago',
      name: 'days_ago',
      desc: '',
      args: [],
    );
  }

  /// ` Hours ago`
  String get hours_ago {
    return Intl.message(
      ' Hours ago',
      name: 'hours_ago',
      desc: '',
      args: [],
    );
  }

  /// ` Mins ago`
  String get mins_ago {
    return Intl.message(
      ' Mins ago',
      name: 'mins_ago',
      desc: '',
      args: [],
    );
  }

  /// `Just now`
  String get just_now {
    return Intl.message(
      'Just now',
      name: 'just_now',
      desc: '',
      args: [],
    );
  }

  /// `The email is already taken try with another email address`
  String get email_taken {
    return Intl.message(
      'The email is already taken try with another email address',
      name: 'email_taken',
      desc: '',
      args: [],
    );
  }

  /// `Country`
  String get country {
    return Intl.message(
      'Country',
      name: 'country',
      desc: '',
      args: [],
    );
  }

  /// `Your login or password is incorrect.`
  String get msg_login_invalid {
    return Intl.message(
      'Your login or password is incorrect.',
      name: 'msg_login_invalid',
      desc: '',
      args: [],
    );
  }

  /// `No results found for your search.`
  String get msg_no_events_search {
    return Intl.message(
      'No results found for your search.',
      name: 'msg_no_events_search',
      desc: '',
      args: [],
    );
  }

  /// `By creating an account, you agree`
  String get tc_label {
    return Intl.message(
      'By creating an account, you agree',
      name: 'tc_label',
      desc: '',
      args: [],
    );
  }

  /// `to our terms of use and privacy policy.`
  String get tc_text {
    return Intl.message(
      'to our terms of use and privacy policy.',
      name: 'tc_text',
      desc: '',
      args: [],
    );
  }

  /// `Please check the terms and conditions to continue.`
  String get msg_check_tc {
    return Intl.message(
      'Please check the terms and conditions to continue.',
      name: 'msg_check_tc',
      desc: '',
      args: [],
    );
  }

  /// `Event page under progress`
  String get msg_url_not_found {
    return Intl.message(
      'Event page under progress',
      name: 'msg_url_not_found',
      desc: '',
      args: [],
    );
  }

  /// `Please subscribe to the event to attend this conference.`
  String get msg_pls_subscribe_for_conference {
    return Intl.message(
      'Please subscribe to the event to attend this conference.',
      name: 'msg_pls_subscribe_for_conference',
      desc: '',
      args: [],
    );
  }

  /// `Your request is under review.`
  String get msg_request_under_review {
    return Intl.message(
      'Your request is under review.',
      name: 'msg_request_under_review',
      desc: '',
      args: [],
    );
  }

  /// `Your request is not approved`
  String get msg_request_rejected {
    return Intl.message(
      'Your request is not approved',
      name: 'msg_request_rejected',
      desc: '',
      args: [],
    );
  }

  /// `Not approved`
  String get rejected {
    return Intl.message(
      'Not approved',
      name: 'rejected',
      desc: '',
      args: [],
    );
  }

  /// `Pending`
  String get pending {
    return Intl.message(
      'Pending',
      name: 'pending',
      desc: '',
      args: [],
    );
  }

  /// `Your booking request has been rejected`
  String get request_rejected {
    return Intl.message(
      'Your booking request has been rejected',
      name: 'request_rejected',
      desc: '',
      args: [],
    );
  }

  /// `Email`
  String get address_email {
    return Intl.message(
      'Email',
      name: 'address_email',
      desc: '',
      args: [],
    );
  }

  /// `Phone number`
  String get number_tele {
    return Intl.message(
      'Phone number',
      name: 'number_tele',
      desc: '',
      args: [],
    );
  }

  /// `Delete picture`
  String get delete_pic {
    return Intl.message(
      'Delete picture',
      name: 'delete_pic',
      desc: '',
      args: [],
    );
  }

  /// `Save`
  String get save {
    return Intl.message(
      'Save',
      name: 'save',
      desc: '',
      args: [],
    );
  }
}

class AppLocalizationDelegate extends LocalizationsDelegate<S> {
  const AppLocalizationDelegate();

  List<Locale> get supportedLocales {
    return const <Locale>[
      Locale.fromSubtags(languageCode: 'en'),
      Locale.fromSubtags(languageCode: 'fr'),
    ];
  }

  @override
  bool isSupported(Locale locale) => _isSupported(locale);
  @override
  Future<S> load(Locale locale) => S.load(locale);
  @override
  bool shouldReload(AppLocalizationDelegate old) => false;

  bool _isSupported(Locale locale) {
    for (var supportedLocale in supportedLocales) {
      if (supportedLocale.languageCode == locale.languageCode) {
        return true;
      }
    }
    return false;
  }
}
