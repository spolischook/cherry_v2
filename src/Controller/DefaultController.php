<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends Controller
{
    /**
     * @Route(name="index", path="/{_locale}/")
     */
    public function index()
    {
        return $this->render('default/index.html.twig');
    }
}
