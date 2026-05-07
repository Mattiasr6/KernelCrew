<?php

namespace App\Enums;

enum CourseStatus: string
{
    case DRAFT = 'DRAFT';
    case IN_REVIEW = 'IN_REVIEW';
    case PUBLISHED = 'PUBLISHED';
    case REJECTED = 'REJECTED';
}
